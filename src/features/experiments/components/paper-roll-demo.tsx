import { useEffect, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COLS = 18;
const ROWS = 32;
const SPACING = 0.045;
const GRAVITY = new THREE.Vector3(0, -3.0, 0);
const DAMPING = 0.992;
const TIMESTEP = 0.007;
const SUB_STEPS = 5;
const CONSTRAINT_ITERS = 12;
const BEND_COMPLIANCE = 0.06;
const INFLUENCE_RADIUS = 1;
const INFLUENCE_FALLOFF = 2.0;
const MAX_DISPLACEMENT = 0.2;
const GRAB_SPRING = 0.35;

const STRUCT_REST = SPACING;
const SHEAR_REST = SPACING * Math.SQRT2;
const BEND_REST = SPACING * 2;

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

function createReceiptTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 768;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#fefefe";
  ctx.fillRect(0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  for (let i = 0; i < 5; i++) {
    const cx = Math.random() * w;
    const cy = Math.random() * h;
    const rx = 40 + Math.random() * 80;
    const ry = 30 + Math.random() * 60;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    grad.addColorStop(0, "rgba(245, 242, 238, 0.15)");
    grad.addColorStop(1, "rgba(254, 254, 254, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const creases = [
    { y: h * 0.32, angle: 0.01, opacity: 0.06 },
    { y: h * 0.58, angle: -0.008, opacity: 0.05 },
    { y: h * 0.78, angle: 0.005, opacity: 0.04 },
  ];

  for (const crease of creases) {
    ctx.save();
    ctx.translate(0, crease.y);
    ctx.rotate(crease.angle);

    ctx.strokeStyle = `rgba(0, 0, 0, ${crease.opacity})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 255, ${crease.opacity * 1.5})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 1.5);
    ctx.lineTo(w, 1.5);
    ctx.stroke();

    ctx.restore();
  }

  ctx.save();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.15, 0);
  ctx.lineTo(w * 0.55, h);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.15 + 1.5, 0);
  ctx.lineTo(w * 0.55 + 1.5, h);
  ctx.stroke();
  ctx.restore();

  const cornerGrad = ctx.createRadialGradient(w, h, 0, w, h, 200);
  cornerGrad.addColorStop(0, "rgba(240, 237, 233, 0.08)");
  cornerGrad.addColorStop(1, "rgba(254, 254, 254, 0)");
  ctx.fillStyle = cornerGrad;
  ctx.fillRect(0, 0, w, h);

  const topGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 180);
  topGrad.addColorStop(0, "rgba(240, 237, 233, 0.06)");
  topGrad.addColorStop(1, "rgba(254, 254, 254, 0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, h);

  const marginX = 48;
  let curY = 50;

  const drawText = (text: string, size: number, color: string, align: "left" | "center" | "right" = "left", bold = false) => {
    ctx.font = `${bold ? "bold " : ""}${size}px "Courier New", "Courier", monospace`;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    if (align === "center") {
      ctx.textAlign = "center";
      ctx.fillText(text, w / 2, curY);
    } else if (align === "right") {
      ctx.textAlign = "right";
      ctx.fillText(text, w - marginX, curY);
    } else {
      ctx.textAlign = "left";
      ctx.fillText(text, marginX, curY);
    }
    curY += size + 4;
  };

  const drawLine = () => {
    ctx.strokeStyle = "#d0d0d0";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(marginX, curY);
    ctx.lineTo(w - marginX, curY);
    ctx.stroke();
    curY += 10;
  };

  const drawDashedLine = () => {
    ctx.strokeStyle = "#c0c0c0";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(marginX, curY);
    ctx.lineTo(w - marginX, curY);
    ctx.stroke();
    ctx.setLineDash([]);
    curY += 10;
  };

  const drawRow = (left: string, right: string, size: number, color: string, bold = false) => {
    ctx.font = `${bold ? "bold " : ""}${size}px "Courier New", "Courier", monospace`;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(left, marginX, curY);
    ctx.textAlign = "right";
    ctx.fillText(right, w - marginX, curY);
    curY += size + 4;
  };

  const addSpace = (px: number) => { curY += px; };

  drawText("THE PAPER SHOP", 22, "#222", "center", true);
  addSpace(2);
  drawText("42 Mesh Lane, WebGL City", 13, "#666", "center");
  drawText("Tel: (555) 042-1337", 13, "#666", "center");
  addSpace(8);

  drawLine();
  addSpace(4);

  drawText("Date: 2026-02-23  14:17", 13, "#444");
  drawText("Order: #00382", 13, "#444");
  addSpace(6);

  drawDashedLine();
  addSpace(4);

  drawRow("Vertex Shader", "$4.20", 14, "#333");
  addSpace(2);
  drawRow("Fragment Shader", "$3.50", 14, "#333");
  addSpace(2);
  drawRow("Normal Map", "$2.80", 14, "#333");
  addSpace(2);
  drawRow("UV Unwrap", "$1.50", 14, "#333");
  addSpace(2);
  drawRow("Cloth Simulation", "$6.00", 14, "#333");
  addSpace(6);

  drawDashedLine();
  addSpace(4);

  drawRow("Subtotal", "$18.00", 14, "#444");
  addSpace(2);
  drawRow("Tax (8%)", "$1.44", 13, "#666");
  addSpace(6);

  drawLine();
  addSpace(4);

  drawRow("TOTAL", "$19.44", 18, "#111", true);
  addSpace(12);

  drawDashedLine();
  addSpace(10);

  drawText("Thank you for visiting!", 13, "#888", "center");
  addSpace(4);
  drawText("github.com/floriandwt", 12, "#aaa", "center");

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  return texture;
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
  uniform sampler2D uReceiptTex;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 texColor = texture2D(uReceiptTex, vUv).rgb;

    vec3 n = normalize(vNormal);
    vec3 v = normalize(cameraPosition - vWorldPos);

    vec3 sunDir = normalize(vec3(0.6, 0.9, 0.7));
    vec3 fillDir = normalize(vec3(-0.4, 0.3, 0.8));

    float sunDiff = max(dot(n, sunDir), 0.0);
    float fillDiff = max(dot(n, fillDir), 0.0);

    float ambient = 0.78;
    float lit = ambient + sunDiff * 0.18 + fillDiff * 0.04;

    vec3 halfVec = normalize(sunDir + v);
    float spec = pow(max(dot(n, halfVec), 0.0), 120.0) * 0.03;

    float edgeX = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x);
    float edgeY = smoothstep(0.0, 0.03, vUv.y) * smoothstep(1.0, 0.97, vUv.y);
    float edgeShadow = edgeX * edgeY;
    float edgeDarken = mix(0.92, 1.0, edgeShadow);

    float back = gl_FrontFacing ? 1.0 : 0.88;

    vec3 col = texColor * lit * back * edgeDarken + vec3(spec);

    col = min(col, vec3(1.0));

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

  const receiptTexture = useMemo(() => createReceiptTexture(), []);

  const sim = useMemo(() => {
    const count = COLS * ROWS;
    const pos = new Float32Array(count * 3);
    const old = new Float32Array(count * 3);
    const rest = new Float32Array(count * 3);
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
        rest[i * 3] = x;
        rest[i * 3 + 1] = y;
        rest[i * 3 + 2] = 0;
        if (r === 0) pinned[i] = 1;
      }
    }

    const constraints = buildConstraints();
    return { pos, old, rest, pinned, constraints, count };
  }, []);

  useFrame(() => {
    const { pos, old, rest, pinned, constraints, count } = sim;

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

        const dx = pos[ix] - rest[ix];
        const dy = pos[iy] - rest[iy];
        const dz = pos[iz] - rest[iz];
        const disp = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (disp > MAX_DISPLACEMENT) {
          const scale = MAX_DISPLACEMENT / disp;
          pos[ix] = rest[ix] + dx * scale;
          pos[iy] = rest[iy] + dy * scale;
          pos[iz] = rest[iz] + dz * scale;
        }
      }

      if (grab.current.active && grab.current.idx >= 0) {
        const gi = grab.current.idx * 3;
        const gp = grab.current.point;

        const targetX = gp.x;
        const targetY = gp.y;
        const targetZ = gp.z;

        pos[gi] += (targetX - pos[gi]) * GRAB_SPRING;
        pos[gi + 1] += (targetY - pos[gi + 1]) * GRAB_SPRING;
        pos[gi + 2] += (targetZ - pos[gi + 2]) * GRAB_SPRING;

        const gdx = pos[gi] - rest[gi];
        const gdy = pos[gi + 1] - rest[gi + 1];
        const gdz = pos[gi + 2] - rest[gi + 2];
        const gDisp = Math.sqrt(gdx * gdx + gdy * gdy + gdz * gdz);
        if (gDisp > MAX_DISPLACEMENT) {
          const gScale = MAX_DISPLACEMENT / gDisp;
          pos[gi] = rest[gi] + gdx * gScale;
          pos[gi + 1] = rest[gi + 1] + gdy * gScale;
          pos[gi + 2] = rest[gi + 2] + gdz * gScale;
        }

        old[gi] = pos[gi];
        old[gi + 1] = pos[gi + 1];
        old[gi + 2] = pos[gi + 2];

        for (const inf of grab.current.influenced) {
          if (pinned[inf.idx]) continue;
          const ii = inf.idx * 3;
          const deltaX = pos[gi] - rest[gi];
          const deltaY = pos[gi + 1] - rest[gi + 1];
          const deltaZ = pos[gi + 2] - rest[gi + 2];
          const tx = rest[ii] + deltaX * inf.weight;
          const ty = rest[ii + 1] + deltaY * inf.weight;
          const tz = rest[ii + 2] + deltaZ * inf.weight;
          const blend = inf.weight * 0.4;
          pos[ii] += (tx - pos[ii]) * blend;
          pos[ii + 1] += (ty - pos[ii + 1]) * blend;
          pos[ii + 2] += (tz - pos[ii + 2]) * blend;
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

  const uniforms = useMemo(() => ({
    uReceiptTex: { value: receiptTexture },
  }), [receiptTexture]);

  return (
    <mesh>
      <primitive object={geometry} ref={geoRef} attach="geometry" />
      <shaderMaterial
        vertexShader={vertShader}
        fragmentShader={fragShader}
        uniforms={uniforms}
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
      camera.position.set(0, 0.02, 2.4);
      camera.lookAt(0, -0.1, 0);
    }
  }, [camera]);
  return null;
}

function PaperShadow({ grab }: { grab: React.MutableRefObject<GrabInfo> }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const shadowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uOpacity: { value: 0.12 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          vec2 c = vUv - 0.5;
          float d = length(c * vec2(1.0, 1.6));
          float alpha = smoothstep(0.5, 0.15, d) * uOpacity;
          gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
        }
      `,
    });
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    const isGrabbing = grab.current.active;
    shadowMaterial.uniforms.uOpacity.value = isGrabbing ? 0.15 : 0.12;
    meshRef.current.position.z = -0.12;
    meshRef.current.position.y = -0.06;
  });

  return (
    <mesh ref={meshRef} material={shadowMaterial}>
      <planeGeometry args={[1.2, 2.0]} />
    </mesh>
  );
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
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 5]} intensity={0.4} color="#fffdf8" />
          <directionalLight position={[-2, 1, 3]} intensity={0.1} />
          <PaperShadow grab={grab} />
          <PaperCloth grab={grab} />
          <Interaction grab={grab} />
        </Canvas>
      </div>
      <p className="text-xs text-quaternary pb-4 opacity-60">
        Grab and drag the receipt
      </p>
    </div>
  );
};
