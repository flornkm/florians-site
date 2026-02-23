import { useEffect, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COLS = 28;
const ROWS = 36;
const SPACING = 0.065;
const GRAVITY = new THREE.Vector3(0, -5.5, 0);
const DAMPING = 0.993;
const TIMESTEP = 0.009;
const SUB_STEPS = 4;
const CONSTRAINT_ITERS = 5;
const BEND_COMPLIANCE = 0.4;
const INFLUENCE_RADIUS = 5;
const INFLUENCE_FALLOFF = 0.6;

const STRUCT_REST = SPACING;
const SHEAR_REST = SPACING * Math.SQRT2;
const BEND_REST = SPACING * 2;

const PAPER_W = (COLS - 1) * SPACING;
const PAPER_H = (ROWS - 1) * SPACING;

function idx(c: number, r: number) {
  return r * COLS + c;
}

interface Constraint {
  i: number;
  j: number;
  rest: number;
  bend: boolean;
}

function buildConstraints(): Constraint[] {
  const out: Constraint[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c < COLS - 1) out.push({ i: idx(c, r), j: idx(c + 1, r), rest: STRUCT_REST, bend: false });
      if (r < ROWS - 1) out.push({ i: idx(c, r), j: idx(c, r + 1), rest: STRUCT_REST, bend: false });
      if (c < COLS - 1 && r < ROWS - 1) {
        out.push({ i: idx(c, r), j: idx(c + 1, r + 1), rest: SHEAR_REST, bend: false });
        out.push({ i: idx(c + 1, r), j: idx(c, r + 1), rest: SHEAR_REST, bend: false });
      }
      if (c < COLS - 2) out.push({ i: idx(c, r), j: idx(c + 2, r), rest: BEND_REST, bend: true });
      if (r < ROWS - 2) out.push({ i: idx(c, r), j: idx(c, r + 2), rest: BEND_REST, bend: true });
    }
  }
  return out;
}

const vertShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const fragShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 base = vec3(0.97, 0.95, 0.91);
    base += vec3(fbm(vUv * 80.0) * 0.03);
    base += vec3(noise(vec2(vUv.x * 400.0, vUv.y * 60.0)) * 0.008);

    float ls = 1.0 / 34.0;
    float lm = mod(vUv.y + 0.001, ls);
    float line = 1.0 - smoothstep(0.0, 0.0012, abs(lm - ls * 0.5));
    base = mix(base, vec3(0.72, 0.80, 0.92), line * 0.2);

    float mg = 1.0 - smoothstep(0.0, 0.002, abs(vUv.x - 0.11));
    base = mix(base, vec3(0.88, 0.50, 0.50), mg * 0.3);

    vec3 n = normalize(vNormal);
    vec3 v = normalize(cameraPosition - vWorldPos);
    vec3 l1 = normalize(vec3(0.3, 0.6, 1.0));
    vec3 l2 = normalize(vec3(-0.5, 0.3, 0.8));

    float d1 = max(dot(n, l1), 0.0);
    float d2 = max(dot(n, l2), 0.0);
    float wrap = max(dot(n, l1) * 0.5 + 0.5, 0.0);
    float lit = 0.32 + d1 * 0.42 + d2 * 0.14 + wrap * 0.12;

    float spec = pow(max(dot(n, normalize(l1 + v)), 0.0), 80.0) * 0.06;
    float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0) * 0.07;
    float back = mix(1.0, 0.7, step(dot(n, v), 0.0));

    vec3 col = base * lit * back + vec3(spec + fres);

    float ex = smoothstep(0.0, 0.008, vUv.x) * smoothstep(0.0, 0.008, 1.0 - vUv.x);
    float ey = smoothstep(0.0, 0.005, vUv.y) * smoothstep(0.0, 0.005, 1.0 - vUv.y);
    col *= 1.0 - (1.0 - ex * ey) * 0.1;

    gl_FragColor = vec4(col, 1.0);
  }
`;

interface GrabInfo {
  active: boolean;
  idx: number;
  plane: THREE.Plane;
  point: THREE.Vector3;
  influenced: { idx: number; weight: number }[];
}

function PaperCloth({ grab }: { grab: React.MutableRefObject<GrabInfo> }) {
  const geoRef = useRef<THREE.BufferGeometry>(null);

  const sim = useMemo(() => {
    const count = COLS * ROWS;
    const pos = new Float32Array(count * 3);
    const old = new Float32Array(count * 3);
    const pinned = new Uint8Array(count);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = idx(c, r);
        const x = (c - (COLS - 1) / 2) * SPACING;
        const y = ((ROWS - 1) / 2 - r) * SPACING;
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = 0;
        old[i * 3] = x;
        old[i * 3 + 1] = y;
        old[i * 3 + 2] = 0;
        if (r === 0) pinned[i] = 1;
      }
    }

    const constraints = buildConstraints();
    return { pos, old, pinned, constraints, count };
  }, []);

  useFrame(() => {
    const { pos, old, pinned, constraints, count } = sim;

    const grabbedSet = new Set<number>();
    if (grab.current.active) {
      grabbedSet.add(grab.current.idx);
      for (const inf of grab.current.influenced) {
        grabbedSet.add(inf.idx);
      }
    }

    for (let s = 0; s < SUB_STEPS; s++) {
      for (let i = 0; i < count; i++) {
        if (pinned[i]) continue;
        if (grabbedSet.has(i)) continue;

        const ix = i * 3, iy = ix + 1, iz = ix + 2;
        const vx = (pos[ix] - old[ix]) * DAMPING;
        const vy = (pos[iy] - old[iy]) * DAMPING;
        const vz = (pos[iz] - old[iz]) * DAMPING;

        old[ix] = pos[ix];
        old[iy] = pos[iy];
        old[iz] = pos[iz];

        pos[ix] += vx + GRAVITY.x * TIMESTEP * TIMESTEP;
        pos[iy] += vy + GRAVITY.y * TIMESTEP * TIMESTEP;
        pos[iz] += vz + GRAVITY.z * TIMESTEP * TIMESTEP;
      }

      if (grab.current.active && grab.current.idx >= 0) {
        const gi = grab.current.idx * 3;
        const gp = grab.current.point;
        old[gi] = gp.x;
        old[gi + 1] = gp.y;
        old[gi + 2] = gp.z;
        pos[gi] = gp.x;
        pos[gi + 1] = gp.y;
        pos[gi + 2] = gp.z;

        const gc = grab.current.idx % COLS;
        const gr = Math.floor(grab.current.idx / COLS);
        const origGx = (gc - (COLS - 1) / 2) * SPACING;
        const origGy = ((ROWS - 1) / 2 - gr) * SPACING;
        const deltaX = gp.x - origGx;
        const deltaY = gp.y - origGy;
        const deltaZ = gp.z;

        for (const inf of grab.current.influenced) {
          if (pinned[inf.idx]) continue;
          const ii = inf.idx * 3;
          const ic = inf.idx % COLS;
          const ir = Math.floor(inf.idx / COLS);
          const origX = (ic - (COLS - 1) / 2) * SPACING;
          const origY = ((ROWS - 1) / 2 - ir) * SPACING;
          const targetX = origX + deltaX * inf.weight;
          const targetY = origY + deltaY * inf.weight;
          const targetZ = deltaZ * inf.weight;
          const blend = inf.weight * 0.85;
          pos[ii] = pos[ii] + (targetX - pos[ii]) * blend;
          pos[ii + 1] = pos[ii + 1] + (targetY - pos[ii + 1]) * blend;
          pos[ii + 2] = pos[ii + 2] + (targetZ - pos[ii + 2]) * blend;
          old[ii] = pos[ii];
          old[ii + 1] = pos[ii + 1];
          old[ii + 2] = pos[ii + 2];
        }
      }

      for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
        for (let c = 0; c < constraints.length; c++) {
          const cn = constraints[c];
          const ai = cn.i * 3, bi = cn.j * 3;
          const dx = pos[bi] - pos[ai];
          const dy = pos[bi + 1] - pos[ai + 1];
          const dz = pos[bi + 2] - pos[ai + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < 1e-6) continue;

          const stiffness = cn.bend ? (1 - BEND_COMPLIANCE) : 1;
          const diff = (dist - cn.rest) / dist * 0.5 * stiffness;
          const ox = dx * diff;
          const oy = dy * diff;
          const oz = dz * diff;

          const aPinned = pinned[cn.i] || grabbedSet.has(cn.i);
          const bPinned = pinned[cn.j] || grabbedSet.has(cn.j);

          if (aPinned && bPinned) continue;
          if (aPinned) {
            pos[bi] -= ox * 2;
            pos[bi + 1] -= oy * 2;
            pos[bi + 2] -= oz * 2;
          } else if (bPinned) {
            pos[ai] += ox * 2;
            pos[ai + 1] += oy * 2;
            pos[ai + 2] += oz * 2;
          } else {
            pos[ai] += ox;
            pos[ai + 1] += oy;
            pos[ai + 2] += oz;
            pos[bi] -= ox;
            pos[bi + 1] -= oy;
            pos[bi + 2] -= oz;
          }
        }
      }
    }

    if (!geoRef.current) return;
    const attr = geoRef.current.getAttribute("position") as THREE.BufferAttribute;
    (attr.array as Float32Array).set(pos);
    attr.needsUpdate = true;
    geoRef.current.computeVertexNormals();
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(sim.pos);
    const uvs = new Float32Array(sim.count * 2);
    const indices: number[] = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = idx(c, r);
        uvs[i * 2] = c / (COLS - 1);
        uvs[i * 2 + 1] = 1 - r / (ROWS - 1);
      }
    }
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS - 1; c++) {
        const a = idx(c, r), b = a + 1, d = idx(c, r + 1), e = d + 1;
        indices.push(a, d, b, b, d, e);
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [sim]);

  return (
    <mesh>
      <primitive object={geometry} ref={geoRef} attach="geometry" />
      <shaderMaterial
        vertexShader={vertShader}
        fragmentShader={fragShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function computeInfluenced(centerIdx: number): { idx: number; weight: number }[] {
  const cc = centerIdx % COLS;
  const cr = Math.floor(centerIdx / COLS);
  const result: { idx: number; weight: number }[] = [];

  for (let dr = -INFLUENCE_RADIUS; dr <= INFLUENCE_RADIUS; dr++) {
    for (let dc = -INFLUENCE_RADIUS; dc <= INFLUENCE_RADIUS; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (nr === 0) continue;
      const dist = Math.sqrt(dr * dr + dc * dc);
      if (dist > INFLUENCE_RADIUS) continue;
      const weight = Math.pow(1 - dist / (INFLUENCE_RADIUS + 1), INFLUENCE_FALLOFF);
      result.push({ idx: idx(nc, nr), weight });
    }
  }

  return result;
}

function Interaction({ grab }: { grab: React.MutableRefObject<GrabInfo> }) {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const ndc = useRef(new THREE.Vector2());
  const hitPoint = useRef(new THREE.Vector3());
  const paperMesh = useRef<THREE.Mesh | null>(null);

  useFrame(() => {
    if (!paperMesh.current) {
      scene.traverse((obj) => {
        if (
          obj instanceof THREE.Mesh &&
          obj.geometry?.getAttribute("position")?.count === COLS * ROWS
        ) {
          paperMesh.current = obj;
        }
      });
    }
  });

  const toNDC = useCallback(
    (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      ndc.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [gl]
  );

  const findNearest = useCallback((point: THREE.Vector3, geo: THREE.BufferGeometry) => {
    const pa = geo.getAttribute("position") as THREE.BufferAttribute;
    let best = -1, bestD = Infinity;
    for (let i = 0; i < pa.count; i++) {
      const dx = pa.getX(i) - point.x;
      const dy = pa.getY(i) - point.y;
      const dz = pa.getZ(i) - point.z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;

    const onDown = (e: PointerEvent) => {
      if (!paperMesh.current) return;
      toNDC(e);
      raycaster.current.setFromCamera(ndc.current, camera);
      const hits = raycaster.current.intersectObject(paperMesh.current, false);
      if (hits.length === 0) return;

      const hit = hits[0];
      const pi = findNearest(hit.point, paperMesh.current!.geometry);
      if (pi < 0) return;
      const row = Math.floor(pi / COLS);
      if (row === 0) return;

      canvas.setPointerCapture(e.pointerId);
      grab.current.active = true;
      grab.current.idx = pi;
      grab.current.point.copy(hit.point);
      grab.current.influenced = computeInfluenced(pi);
      grab.current.plane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion),
        hit.point
      );
    };

    const onMove = (e: PointerEvent) => {
      if (!grab.current.active) return;
      toNDC(e);
      raycaster.current.setFromCamera(ndc.current, camera);
      if (raycaster.current.ray.intersectPlane(grab.current.plane, hitPoint.current)) {
        grab.current.point.copy(hitPoint.current);
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!grab.current.active) return;
      canvas.releasePointerCapture(e.pointerId);
      grab.current.active = false;
      grab.current.idx = -1;
      grab.current.influenced = [];
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [camera, gl, grab, toNDC, findNearest]);

  return null;
}

function SceneSetup() {
  const { camera } = useThree();
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, 0.1, 3.2);
      camera.lookAt(0, -0.1, 0);
    }
  }, [camera]);
  return null;
}

export const PaperRollDemo = () => {
  const grab = useRef<GrabInfo>({
    active: false,
    idx: -1,
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    point: new THREE.Vector3(),
    influenced: [],
  });

  return (
    <div
      className="flex flex-col items-center w-full h-full select-none"
      style={{ touchAction: "none" }}
    >
      <div className="w-full flex-1 min-h-0 cursor-grab active:cursor-grabbing">
        <Canvas
          gl={{ antialias: true, alpha: true }}
          style={{ width: "100%", height: "100%" }}
          camera={{ fov: 35, near: 0.1, far: 100 }}
        >
          <SceneSetup />
          <ambientLight intensity={0.55} />
          <directionalLight position={[2, 3, 5]} intensity={0.65} />
          <directionalLight position={[-3, 1, 3]} intensity={0.2} />
          <PaperCloth grab={grab} />
          <Interaction grab={grab} />
        </Canvas>
      </div>
      <p className="text-xs text-quaternary pb-4 opacity-60">
        Grab and drag the paper
      </p>
    </div>
  );
};
