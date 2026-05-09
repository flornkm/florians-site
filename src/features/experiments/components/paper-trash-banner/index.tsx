import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BUTTON_UV, createCookieBannerTexture } from "./texture";

const MODEL_URL = "/models/trash-bin.glb";
useGLTF.preload(MODEL_URL);

const BIN_SCALE = 1.25;
const BIN_RESTING_Y = -0.62;
const BIN_HIDDEN_Y = -1.6;
const PAPER_Y = 0.0;
const BALL_THRESHOLD = 0.85;
// Bin mouth + interior in WORLD-Y (matches the GLB scaled to BIN_SCALE).
const BIN_MOUTH_Y = BIN_RESTING_Y + 0.30 * BIN_SCALE;
const BIN_INSIDE_Y = BIN_RESTING_Y + 0.04;
const BIN_RIM_RADIUS = 0.122 * BIN_SCALE;

export interface BallState {
  mode: "cloth" | "drag" | "fall" | "in-bin";
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lastCursor: THREE.Vector3;
  lastTime: number;
}

function createBallState(): BallState {
  return {
    mode: "cloth",
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lastCursor: new THREE.Vector3(),
    lastTime: 0,
  };
}

function tuneRealisticMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const name = (mesh.name || "").toLowerCase();
    let mat: THREE.MeshPhysicalMaterial;
    if (name.includes("body")) {
      mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#f3faff"),
        metalness: 0.0,
        // Higher roughness on a transmissive material → three.js blurs the
        // refracted background, giving us a real liquid-glass / frosted look.
        roughness: 0.42,
        transmission: 1.0,
        thickness: 0.7,
        ior: 1.48,
        attenuationColor: new THREE.Color("#bfddf2"),
        attenuationDistance: 1.6,
        clearcoat: 1.0,
        // Sharp clearcoat keeps highlights crisp on top of the frosted body.
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.36,
      });
    } else if (name.includes("recycle")) {
      mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#2c63c4"),
        metalness: 0.10,
        roughness: 0.45,
        clearcoat: 0.85,
        clearcoatRoughness: 0.20,
        emissive: new THREE.Color("#3679d4"),
        emissiveIntensity: 0.15,
        envMapIntensity: 1.0,
      });
    } else {
      // Polished chrome
      mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#dde4ec"),
        metalness: 1.0,
        roughness: 0.18,
        clearcoat: 0.6,
        clearcoatRoughness: 0.10,
        envMapIntensity: 1.3,
      });
    }
    mesh.material = mat;
    // Bin parts don't cast shadows — the chrome rim/foot projected weird
    // sliver shapes onto the backdrop. We add a tiny soft contact shadow
    // beneath the bin via <BinContactShadow /> instead.
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  });
}

function ProceduralEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envTexture = pmrem.fromScene(room, 0.04).texture;
    const previous = scene.environment;
    scene.environment = envTexture;
    return () => {
      scene.environment = previous;
      envTexture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Bin({ ballRef }: { ballRef: React.MutableRefObject<BallState> }) {
  const { scene } = useGLTF(MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);
  // Spring state: progress + velocity. Underdamped → mild overshoot/settle.
  const progressRef = useRef(0);
  const velocityRef = useRef(0);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    tuneRealisticMaterials(c);
    return c;
  }, [scene]);

  useFrame((_, delta) => {
    const wantsVisible = ballRef.current.mode !== "cloth";
    const target = wantsVisible ? 1 : 0;

    // Critically damped spring → smooth glide-in with no overshoot.
    // (stiffness=70, damping=2*sqrt(70)≈16.7 is the no-bounce threshold;
    // bumped to 18 for a touch of extra settle so it can't ring.)
    const dt = Math.min(0.033, delta);
    const stiffness = 70;
    const damping = 18;
    const accel =
      -stiffness * (progressRef.current - target) - damping * velocityRef.current;
    velocityRef.current += accel * dt;
    progressRef.current += velocityRef.current * dt;

    if (groupRef.current) {
      const p = progressRef.current;
      groupRef.current.position.y = BIN_HIDDEN_Y + (BIN_RESTING_Y - BIN_HIDDEN_Y) * p;
      groupRef.current.visible = p > 0.005;
    }
  });

  return (
    <group ref={groupRef} position={[0, BIN_HIDDEN_Y, 0]} visible={false}>
      <primitive object={cloned} scale={[BIN_SCALE, BIN_SCALE, BIN_SCALE]} />
    </group>
  );
}

function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s);
}

function fbm(x: number, y: number, z: number) {
  let total = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < 4; i++) {
    total += (hash3(x * freq, y * freq, z * freq) - 0.5) * amp;
    norm += amp;
    amp *= 0.55;
    freq *= 2.1;
  }
  return total / norm;
}

type Constraint = {
  i: number;
  j: number;
  rest: number;
  bend: boolean;
};

function CrumpledPaper({
  crumpleRef,
  ballRef,
}: {
  crumpleRef: React.MutableRefObject<number>;
  ballRef: React.MutableRefObject<BallState>;
}) {
  const W = 1.05;
  const H = 0.30;
  const COLS = 56;
  const ROWS = 18;
  const { camera, gl } = useThree();

  const sim = useMemo(() => {
    const count = COLS * ROWS;
    const pos = new Float32Array(count * 3);
    const old = new Float32Array(count * 3);
    const flatRest = new Float32Array(count * 3);
    const ballTarget = new Float32Array(count * 3);

    const stepX = W / (COLS - 1);
    const stepY = H / (ROWS - 1);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const x = -W / 2 + c * stepX;
        const y = H / 2 - r * stepY;
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = 0;
        old[i * 3] = x;
        old[i * 3 + 1] = y;
        old[i * 3 + 2] = 0;
        flatRest[i * 3] = x;
        flatRest[i * 3 + 1] = y;
        flatRest[i * 3 + 2] = 0;

        const u = c / (COLS - 1);
        const v = r / (ROWS - 1);
        const tx =
          (fbm(u * 1.8, v * 1.8, 11) - 0.5) * 0.46 +
          (fbm(u * 7.0, v * 7.0, 12) - 0.5) * 0.10;
        const ty =
          (fbm(u * 1.8, v * 1.8, 22) - 0.5) * 0.46 +
          (fbm(u * 7.0, v * 7.0, 23) - 0.5) * 0.10;
        const tz =
          (fbm(u * 1.8, v * 1.8, 33) - 0.5) * 0.55 +
          (fbm(u * 7.0, v * 7.0, 34) - 0.5) * 0.13;
        ballTarget[i * 3] = tx;
        ballTarget[i * 3 + 1] = ty;
        ballTarget[i * 3 + 2] = tz;
      }
    }

    // fbm has a non-zero mean — subtract the centroid so the wad is centered
    // on origin instead of drifting off-axis when fully crumpled.
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let i = 0; i < count; i++) {
      cx += ballTarget[i * 3];
      cy += ballTarget[i * 3 + 1];
      cz += ballTarget[i * 3 + 2];
    }
    cx /= count;
    cy /= count;
    cz /= count;
    for (let i = 0; i < count; i++) {
      ballTarget[i * 3] -= cx;
      ballTarget[i * 3 + 1] -= cy;
      ballTarget[i * 3 + 2] -= cz;
    }

    // Constraints — structural / shear / bend (the receipt's recipe).
    const constraints: Constraint[] = [];
    const restH = stepX;
    const restV = stepY;
    const restDiag = Math.sqrt(restH * restH + restV * restV);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        if (c < COLS - 1)
          constraints.push({ i, j: i + 1, rest: restH, bend: false });
        if (r < ROWS - 1)
          constraints.push({ i, j: i + COLS, rest: restV, bend: false });
        if (c < COLS - 1 && r < ROWS - 1) {
          constraints.push({ i, j: i + COLS + 1, rest: restDiag, bend: false });
          constraints.push({ i: i + 1, j: i + COLS, rest: restDiag, bend: false });
        }
        if (c < COLS - 2)
          constraints.push({ i, j: i + 2, rest: restH * 2, bend: true });
        if (r < ROWS - 2)
          constraints.push({ i, j: i + COLS * 2, rest: restV * 2, bend: true });
      }
    }

    return { pos, old, flatRest, ballTarget, count, constraints };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(W, H, COLS - 1, ROWS - 1);
    return geo;
  }, []);

  const bannerTex = useMemo(() => createCookieBannerTexture({ hover: false }), []);
  const bannerHoverTex = useMemo(
    () => createCookieBannerTexture({ hover: true }),
    [],
  );
  const hoverRef = useRef(false);
  const lastHover = useRef(false);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  /** Custom shader: treat the banner texture like raw screen pixels with no
   *  PBR lighting attenuation. A tiny fold-shade derived from per-fragment
   *  flat normals keeps creases visible without dimming the saturated UI. */
  const paperUniforms = useMemo(
    () => ({
      uMap: { value: bannerTex },
      uShadeStrength: { value: 0.22 },
      // Texture is 1024×304 → aspect ratio drives the rounded-corner SDF so
      // the corners look circular instead of squished.
      uTexAspect: { value: 1024 / 304 },
      // Radius in "tall units" (height = 1.0). 24/304 ≈ 0.079 matches the
      // border drawn into the texture.
      uCornerRadius: { value: 24 / 304 },
    }),
    [bannerTex],
  );

  const paperVertShader = useMemo(
    () => /* glsl */ `
      varying vec2 vUv;
      varying vec3 vViewPos;
      varying vec3 vSmoothNormal;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewPos = mv.xyz;
        vSmoothNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }
    `,
    [],
  );

  const paperFragShader = useMemo(
    () => /* glsl */ `
      uniform sampler2D uMap;
      uniform float uShadeStrength;
      uniform float uTexAspect;
      uniform float uCornerRadius;
      varying vec2 vUv;
      varying vec3 vViewPos;
      varying vec3 vSmoothNormal;
      void main() {
        // Rounded-rect alpha mask: discard fragments outside the card so the
        // actual mesh silhouette matches the painted border. Computed in
        // aspect-corrected UV space so corners are circular, not stretched.
        vec2 p = (vUv - 0.5) * vec2(uTexAspect, 1.0);
        vec2 halfSize = vec2(uTexAspect * 0.5, 0.5);
        vec2 q = abs(p) - halfSize + vec2(uCornerRadius);
        float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uCornerRadius;
        if (dist > 0.0) discard;

        // Blend a flat per-fragment normal (sharp facets) with the geometry's
        // smooth interpolated normal. Keeps the paper-fold feel but softens
        // the chunky triangle look slightly.
        vec3 flatN = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
        vec3 smoothN = normalize(vSmoothNormal);
        vec3 N = normalize(mix(flatN, smoothN, 0.45));
        float facing = clamp(abs(N.z), 0.0, 1.0);
        float shade = 1.0 - (1.0 - facing) * uShadeStrength;
        vec4 c = texture2D(uMap, vUv);
        gl_FragColor = vec4(c.rgb * shade, c.a);
      }
    `,
    [],
  );

  const grabRef = useRef({
    active: false,
    idx: -1,
    point: new THREE.Vector3(),
    start: new THREE.Vector3(),
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
  });

  const groupRef = useRef<THREE.Group>(null);

  // Global pointer handlers for the drag — captures move/up even when the
  // pointer leaves the mesh silhouette by projecting onto a fixed plane.
  useEffect(() => {
    const canvas = gl.domElement;
    const ndc = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const tmp = new THREE.Vector3();

    const projectToPlane = (e: PointerEvent, out: THREE.Vector3) => {
      const rect = canvas.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(grabRef.current.plane, out);
      return out;
    };

    const onMove = (e: PointerEvent) => {
      const ball = ballRef.current;
      if (ball.mode === "drag") {
        projectToPlane(e, tmp);
        // Track velocity for the throw on release.
        const now = performance.now();
        const dtMs = Math.max(8, now - ball.lastTime);
        ball.velocity.set(
          (tmp.x - ball.lastCursor.x) / (dtMs / 1000),
          (tmp.y - ball.lastCursor.y) / (dtMs / 1000),
          (tmp.z - ball.lastCursor.z) / (dtMs / 1000),
        );
        ball.lastCursor.copy(tmp);
        ball.lastTime = now;
        // Position is offset from the paper's resting world position.
        ball.position.set(tmp.x, tmp.y - PAPER_Y, tmp.z);
        return;
      }

      if (!grabRef.current.active) return;
      projectToPlane(e, tmp);
      grabRef.current.point.set(tmp.x, tmp.y - PAPER_Y, tmp.z);
    };

    const onUp = (e: PointerEvent) => {
      const ball = ballRef.current;
      if (ball.mode === "drag") {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {}
        // Cap initial throw speed so the ball can't fly off-screen forever.
        const v = ball.velocity.length();
        if (v > 4.5) ball.velocity.multiplyScalar(4.5 / v);
        ball.mode = "fall";
        return;
      }

      if (!grabRef.current.active) return;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
      const dragLen = grabRef.current.point.distanceTo(grabRef.current.start);
      grabRef.current.active = false;
      grabRef.current.idx = -1;

      if (dragLen > 0.04) {
        const bump = 0.04 + Math.min(0.18, dragLen * 0.32);
        crumpleRef.current = Math.min(1, crumpleRef.current + bump);
      }
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [gl, camera, crumpleRef, ballRef]);

  useFrame(() => {
    const t = crumpleRef.current;
    const { pos, old, flatRest, ballTarget, count, constraints } = sim;

    const DAMPING = 0.78;
    const ANCHOR = 0.10;
    const SUB_STEPS = 2;
    const ITERS = 14;
    const BEND_STIFFNESS = 0.94;
    const lenScale = 1 - t * 0.42;

    const grabIdx = grabRef.current.active ? grabRef.current.idx : -1;
    const gp = grabRef.current.point;

    for (let s = 0; s < SUB_STEPS; s++) {
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        if (i === grabIdx) {
          // Pinned to the cursor — no integration, no anchor pull.
          pos[ix] = gp.x;
          pos[iy] = gp.y;
          pos[iz] = gp.z;
          old[ix] = gp.x;
          old[iy] = gp.y;
          old[iz] = gp.z;
          continue;
        }

        const tx = flatRest[ix] + (ballTarget[ix] - flatRest[ix]) * t;
        const ty = flatRest[iy] + (ballTarget[iy] - flatRest[iy]) * t;
        const tz = flatRest[iz] + (ballTarget[iz] - flatRest[iz]) * t;

        const vx = (pos[ix] - old[ix]) * DAMPING;
        const vy = (pos[iy] - old[iy]) * DAMPING;
        const vz = (pos[iz] - old[iz]) * DAMPING;
        old[ix] = pos[ix];
        old[iy] = pos[iy];
        old[iz] = pos[iz];
        pos[ix] += vx + (tx - pos[ix]) * ANCHOR;
        pos[iy] += vy + (ty - pos[iy]) * ANCHOR;
        pos[iz] += vz + (tz - pos[iz]) * ANCHOR;
      }

      for (let iter = 0; iter < ITERS; iter++) {
        for (let m = 0; m < constraints.length; m++) {
          const cn = constraints[m];
          const ai = cn.i * 3;
          const bi = cn.j * 3;
          const dx = pos[bi] - pos[ai];
          const dy = pos[bi + 1] - pos[ai + 1];
          const dz = pos[bi + 2] - pos[ai + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < 1e-6) continue;
          const stiffness = cn.bend ? BEND_STIFFNESS : 1;
          const target = cn.rest * lenScale;
          const diff = ((dist - target) / dist) * 0.5 * stiffness;
          const ox = dx * diff;
          const oy = dy * diff;
          const oz = dz * diff;

          // If one endpoint is the pinned grab vertex, only the other moves
          // (and moves twice as much to keep the constraint satisfied).
          if (cn.i === grabIdx) {
            pos[bi] -= ox * 2;
            pos[bi + 1] -= oy * 2;
            pos[bi + 2] -= oz * 2;
          } else if (cn.j === grabIdx) {
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

    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    (attr.array as Float32Array).set(pos);
    attr.needsUpdate = true;
    geometry.computeVertexNormals();

    // -------- Ball state machine + group translation --------
    const ball = ballRef.current;
    const dt = 1 / 60;

    // If user uncrumples below threshold, snap back to original position so
    // the cloth shows in its rest spot again.
    if (crumpleRef.current < BALL_THRESHOLD && ball.mode !== "cloth") {
      ball.mode = "cloth";
      ball.position.set(0, 0, 0);
      ball.velocity.set(0, 0, 0);
    }

    if (ball.mode === "fall") {
      // More physically-accurate gravity (scene units roughly = decimetres).
      const GRAVITY = 8.6;
      ball.velocity.y -= GRAVITY * dt;

      // Magnetic pull toward bin only kicks in once the wad is descending
      // AND it ramps up the closer we get to the bin's mouth — that way an
      // upward-thrown ball arcs naturally first, then converges as it falls.
      const worldY = PAPER_Y + ball.position.y;
      const distAboveMouth = Math.max(0, worldY - BIN_MOUTH_Y);
      const proximity = Math.max(0, Math.min(1, 1 - distAboveMouth / 1.0));
      if (ball.velocity.y < 0) {
        const dx = 0 - ball.position.x;
        const dz = 0 - ball.position.z;
        const pull = 2.2 + proximity * 7.0;
        ball.velocity.x += dx * pull * dt;
        ball.velocity.z += dz * pull * 0.8 * dt;
      }

      // Mild air drag — keeps motion natural, doesn't kill momentum.
      ball.velocity.multiplyScalar(0.992);
      ball.position.addScaledVector(ball.velocity, dt);

      // Inside the bin: stronger settle. Side walls clamp x/z so the ball
      // can't pass through; vertical motion continues until it touches the
      // interior floor.
      const insideMouth =
        worldY < BIN_MOUTH_Y &&
        Math.abs(ball.position.x) < BIN_RIM_RADIUS * 1.3 &&
        Math.abs(ball.position.z) < BIN_RIM_RADIUS * 1.3;

      if (insideMouth) {
        const wallR = BIN_RIM_RADIUS * 0.85;
        if (Math.abs(ball.position.x) > wallR) {
          ball.position.x = Math.sign(ball.position.x) * wallR;
          ball.velocity.x *= -0.25;
        }
        if (Math.abs(ball.position.z) > wallR) {
          ball.position.z = Math.sign(ball.position.z) * wallR;
          ball.velocity.z *= -0.25;
        }
        // Friction inside the bin — slows xz so the wad lands central.
        ball.velocity.x *= 0.92;
        ball.velocity.z *= 0.92;

        const targetY = BIN_INSIDE_Y - PAPER_Y;
        if (ball.position.y <= targetY + 0.008) {
          ball.position.y = targetY;
          ball.position.x *= 0.55;
          ball.position.z *= 0.55;
          ball.velocity.set(0, 0, 0);
          ball.mode = "in-bin";
        }
      }
    }

    if (groupRef.current) {
      groupRef.current.position.set(
        ball.position.x,
        ball.position.y,
        ball.position.z,
      );
    }

    if (hoverRef.current !== lastHover.current) {
      paperUniforms.uMap.value = hoverRef.current ? bannerHoverTex : bannerTex;
      // Force a re-upload binding so the GPU samples the new texture.
      (paperUniforms.uMap.value as THREE.Texture).needsUpdate = false;
      // Cursor cue on the canvas wrapper.
      const wrap = (gl.domElement.parentElement as HTMLElement) ?? null;
      if (wrap) {
        wrap.style.cursor = hoverRef.current ? "pointer" : "";
      }
      lastHover.current = hoverRef.current;
    }
  });

  return (
    <group ref={groupRef}>
    <mesh
      position={[0, PAPER_Y, 0]}
      geometry={geometry}
      castShadow
      onPointerDown={(e) => {
        e.stopPropagation();
        const wp = e.point;
        const ball = ballRef.current;
        const now = performance.now();

        // Ball-drag mode: once the paper is crumpled enough, the cursor
        // moves the whole wad rather than tugging individual vertices.
        if (
          crumpleRef.current >= BALL_THRESHOLD &&
          (ball.mode === "cloth" || ball.mode === "fall")
        ) {
          try {
            gl.domElement.setPointerCapture(e.pointerId);
          } catch {}
          ball.mode = "drag";
          // Drag plane goes through the wad's *current* world centre so the
          // cursor maps 1:1 to a believable depth.
          const ballWorld = new THREE.Vector3(
            ball.position.x,
            PAPER_Y + ball.position.y,
            ball.position.z,
          );
          grabRef.current.plane.setFromNormalAndCoplanarPoint(
            new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion),
            ballWorld,
          );
          ball.lastCursor.copy(wp);
          ball.lastTime = now;
          ball.velocity.set(0, 0, 0);
          hoverRef.current = false;
          return;
        }

        // Cloth-grab mode: tug a single vertex.
        let bestIdx = -1;
        let bestD = Infinity;
        const arr = sim.pos;
        for (let i = 0; i < sim.count; i++) {
          const ix = i * 3;
          const dx = arr[ix] - wp.x;
          const dy = arr[ix + 1] + PAPER_Y - wp.y;
          const dz = arr[ix + 2] - wp.z;
          const d = dx * dx + dy * dy + dz * dz;
          if (d < bestD) {
            bestD = d;
            bestIdx = i;
          }
        }
        if (bestIdx < 0) return;
        try {
          gl.domElement.setPointerCapture(e.pointerId);
        } catch {}
        grabRef.current.plane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion),
          wp,
        );
        grabRef.current.active = true;
        grabRef.current.idx = bestIdx;
        grabRef.current.point.set(wp.x, wp.y - PAPER_Y, wp.z);
        grabRef.current.start.copy(grabRef.current.point);
        hoverRef.current = false;
      }}
      onPointerMove={(e) => {
        // Hover detection still runs unless the paper is heavily folded or
        // we're actively grabbing (so a slight crumple doesn't kill hover).
        if (grabRef.current.active || crumpleRef.current > 0.25) {
          hoverRef.current = false;
          return;
        }
        const uv = e.uv;
        if (!uv) return;
        hoverRef.current =
          uv.x >= BUTTON_UV.uMin &&
          uv.x <= BUTTON_UV.uMax &&
          uv.y >= BUTTON_UV.vMin &&
          uv.y <= BUTTON_UV.vMax;
      }}
      onPointerOut={() => {
        hoverRef.current = false;
      }}
    >
      <shaderMaterial
        ref={matRef}
        vertexShader={paperVertShader}
        fragmentShader={paperFragShader}
        uniforms={paperUniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
    </group>
  );
}

/** Receiver plane behind the paper — only renders the shadow that the cloth
 *  geometry casts onto it (via three.js's shadow map). Morphs with the cloth
 *  automatically because the shadow is the paper's actual silhouette. */
function BackdropShadow() {
  return (
    <mesh position={[0, 0, -0.32]} receiveShadow>
      <planeGeometry args={[4, 3]} />
      <shadowMaterial opacity={0.12} transparent />
    </mesh>
  );
}

function FitCamera() {
  const { camera, size } = useThree();
  const target = useRef(2.4);
  useFrame(() => {
    const aspect = size.width / Math.max(1, size.height);
    const fov = (camera as THREE.PerspectiveCamera).fov;
    const fovRad = (fov * Math.PI) / 180;
    // Fit both vertical content (bin → top of paper, ~1.7 units) and
    // horizontal content (banner ~1.2 wide). Whichever needs more z wins.
    const targetHeight = 1.95;
    const targetWidth = 1.30;
    const zForHeight = targetHeight / (2 * Math.tan(fovRad / 2));
    const zForWidth = targetWidth / (2 * Math.tan(fovRad / 2) * Math.max(0.4, aspect));
    const z = Math.max(zForHeight, zForWidth);
    target.current = Math.max(1.6, Math.min(z, 5.5));
    if (Math.abs(camera.position.z - target.current) > 0.005) {
      camera.position.z += (target.current - camera.position.z) * 0.2;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

export function PaperTrashBanner() {
  const crumpleRef = useRef(0);
  const ballRef = useRef<BallState>(createBallState());

  return (
    <div
      className="relative flex flex-col items-center w-full h-full select-none"
      style={{ touchAction: "none" }}
    >
      <div className="w-full flex-1 min-h-0 active:cursor-grabbing">
        <Canvas
          flat
          shadows="variance"
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.NoToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 0.05, 2.4], fov: 38, near: 0.1, far: 100 }}
        >
          <ProceduralEnvironment />
          <FitCamera />
          <ambientLight intensity={0.35} color="#e8f3ff" />
          <directionalLight
            position={[0.05, 0.3, 3.2]}
            intensity={0.85}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={6}
            shadow-camera-left={-1.4}
            shadow-camera-right={1.4}
            shadow-camera-top={1.0}
            shadow-camera-bottom={-1.2}
            shadow-bias={-0.0005}
            shadow-radius={80}
            shadow-blurSamples={64}
          />
          <directionalLight position={[-3, 2.5, 2]} intensity={0.4} color="#bce0ff" />
          <directionalLight position={[0, 4, -2]} intensity={0.3} color="#ffffff" />
          <Bin ballRef={ballRef} />
          <BackdropShadow />
          <CrumpledPaper crumpleRef={crumpleRef} ballRef={ballRef} />
        </Canvas>
      </div>
    </div>
  );
}
