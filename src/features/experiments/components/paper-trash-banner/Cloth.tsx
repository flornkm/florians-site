import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  ANCHOR_PULL,
  BALL_LEN_SCALE,
  BEND_COMPLIANCE,
  COLS,
  CONSTRAINT_ITERS,
  DAMPING,
  GRAB_SPRING,
  GRAVITY,
  MAX_DISPLACEMENT,
  ROWS,
  SPACING,
  SUB_STEPS,
  TIMESTEP,
  buildBallRest,
  buildConstraints,
  idx,
} from "./physics";
import { createCookieBannerTexture } from "./texture";
import type { FlowRef, GrabRef } from "./types";

const vertShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragShader = /* glsl */ `
  uniform sampler2D uBannerTex;
  uniform float uCrumple;
  varying vec2 vUv;
  varying vec3 vNormal;

  float pHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float pNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = pHash(i);
    float b = pHash(i + vec2(1.0, 0.0));
    float c = pHash(i + vec2(0.0, 1.0));
    float d = pHash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    vec4 tex = texture2D(uBannerTex, vUv);
    vec3 N = normalize(vNormal);

    vec3 L1 = normalize(vec3(0.35, 0.7, 1.0));
    vec3 L2 = normalize(vec3(-0.5, 0.2, 0.6));
    float diff = clamp(dot(N, L1), 0.0, 1.0) * 0.55
               + clamp(dot(N, L2), 0.0, 1.0) * 0.25;
    float lighting = 0.55 + diff;

    float facing = clamp(N.z, 0.0, 1.0);
    float crease = (1.0 - facing) * uCrumple;
    float creaseShade = 1.0 - crease * 0.55;

    float grainBase = pNoise(vUv * vec2(160.0, 80.0)) * 0.18;
    float grainFine = pNoise(vUv * vec2(560.0, 380.0)) * 0.12;
    float grainCrumple = pNoise(vUv * vec2(40.0, 22.0)) * 0.32 * uCrumple;
    float grain = grainBase + grainFine + grainCrumple;

    float streak = step(0.78, pNoise(vUv * vec2(8.0, 30.0))) * uCrumple * 0.18;

    vec3 color = tex.rgb * lighting * creaseShade;
    color *= 1.0 - grain * (0.4 + uCrumple * 0.6);
    color -= streak;
    color = mix(color, color * vec3(1.04, 1.0, 0.94), uCrumple * 0.35);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface Sim {
  pos: Float32Array;
  old: Float32Array;
  rest: Float32Array;
  learnedRest: Float32Array;
  ballRest: Float32Array;
  effRest: Float32Array;
  count: number;
  constraints: ReturnType<typeof buildConstraints>;
}

export function Cloth({ grab, flow }: { grab: GrabRef; flow: FlowRef }) {
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const groupRef = useRef<THREE.Group>(null);

  const bannerTex = useMemo(() => createCookieBannerTexture(), []);

  const sim = useMemo<Sim>(() => {
    const count = COLS * ROWS;
    const pos = new Float32Array(count * 3);
    const old = new Float32Array(count * 3);
    const rest = new Float32Array(count * 3);
    const learnedRest = new Float32Array(count * 3);

    const halfW = (COLS - 1) * SPACING * 0.5;
    const halfH = (ROWS - 1) * SPACING * 0.5;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = idx(c, r);
        const x = c * SPACING - halfW;
        const y = halfH - r * SPACING;
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = 0;
        old[i * 3] = x;
        old[i * 3 + 1] = y;
        old[i * 3 + 2] = 0;
        rest[i * 3] = x;
        rest[i * 3 + 1] = y;
        rest[i * 3 + 2] = 0;
      }
    }
    learnedRest.set(rest);
    const ballRest = buildBallRest(rest);
    const effRest = new Float32Array(count * 3);
    effRest.set(rest);

    return {
      pos,
      old,
      rest,
      learnedRest,
      ballRest,
      effRest,
      count,
      constraints: buildConstraints(),
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uBannerTex: { value: bannerTex },
      uCrumple: { value: 0 },
    }),
    [bannerTex],
  );

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
        const a = idx(c, r);
        const b = a + 1;
        const d = idx(c, r + 1);
        const e = d + 1;
        indices.push(a, d, b, b, d, e);
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [sim]);

  useFrame(() => {
    const f = flow.current;
    f.displayedCrumple += (f.crumpleAmount - f.displayedCrumple) * 0.06;
    const c = f.displayedCrumple;
    uniforms.uCrumple.value = c;

    const { pos, old, rest, learnedRest, ballRest, effRest, count, constraints } = sim;

    if (f.pendingBake) {
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        learnedRest[ix] += (pos[ix] - learnedRest[ix]) * 0.65;
        learnedRest[ix + 1] += (pos[ix + 1] - learnedRest[ix + 1]) * 0.65;
        learnedRest[ix + 2] += (pos[ix + 2] - learnedRest[ix + 2]) * 0.9;
      }
      f.pendingBake = false;
    }

    // Effective rest = lerp(learnedRest, ballRest, easedCrumple).
    // As crumple grows, every vertex migrates toward its ball target so the
    // paper genuinely bunches into a 3D wad rather than just rotating in plane.
    const ballBlend = c * c * 0.95;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      effRest[ix] = learnedRest[ix] + (ballRest[ix] - learnedRest[ix]) * ballBlend;
      effRest[ix + 1] =
        learnedRest[ix + 1] + (ballRest[ix + 1] - learnedRest[ix + 1]) * ballBlend;
      effRest[ix + 2] =
        learnedRest[ix + 2] + (ballRest[ix + 2] - learnedRest[ix + 2]) * ballBlend;
    }

    const ballMode = f.phase !== "flat";

    const grabbedSet = new Set<number>();
    if (!ballMode && grab.current.active) {
      grabbedSet.add(grab.current.idx);
      for (const inf of grab.current.influenced) grabbedSet.add(inf.idx);
    }

    // Constraint rest length compresses as the paper crumples (paper bunches).
    const lenScale = 1 - c * (1 - BALL_LEN_SCALE);

    for (let s = 0; s < SUB_STEPS; s++) {
      for (let i = 0; i < count; i++) {
        if (grabbedSet.has(i)) continue;
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;
        const vx = (pos[ix] - old[ix]) * DAMPING;
        const vy = (pos[iy] - old[iy]) * DAMPING;
        const vz = (pos[iz] - old[iz]) * DAMPING;
        old[ix] = pos[ix];
        old[iy] = pos[iy];
        old[iz] = pos[iz];

        const ax = (effRest[ix] - pos[ix]) * ANCHOR_PULL;
        const ay = (effRest[iy] - pos[iy]) * ANCHOR_PULL;
        const az = (effRest[iz] - pos[iz]) * ANCHOR_PULL;
        const grav = ballMode ? 0 : GRAVITY.y * TIMESTEP * TIMESTEP;

        pos[ix] += vx + ax;
        pos[iy] += vy + ay + grav;
        pos[iz] += vz + az;

        const dx = pos[ix] - effRest[ix];
        const dy = pos[iy] - effRest[iy];
        const dz = pos[iz] - effRest[iz];
        const disp = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (disp > MAX_DISPLACEMENT) {
          const scale = MAX_DISPLACEMENT / disp;
          pos[ix] = effRest[ix] + dx * scale;
          pos[iy] = effRest[iy] + dy * scale;
          pos[iz] = effRest[iz] + dz * scale;
        }
      }

      if (!ballMode && grab.current.active && grab.current.idx >= 0) {
        const gi = grab.current.idx * 3;
        const gp = grab.current.point;
        pos[gi] += (gp.x - pos[gi]) * GRAB_SPRING;
        pos[gi + 1] += (gp.y - pos[gi + 1]) * GRAB_SPRING;
        pos[gi + 2] += (gp.z - pos[gi + 2]) * GRAB_SPRING;
        old[gi] = pos[gi];
        old[gi + 1] = pos[gi + 1];
        old[gi + 2] = pos[gi + 2];

        for (const inf of grab.current.influenced) {
          const ii = inf.idx * 3;
          const dx = pos[gi] - effRest[gi];
          const dy = pos[gi + 1] - effRest[gi + 1];
          const dz = pos[gi + 2] - effRest[gi + 2];
          const tx = effRest[ii] + dx * inf.weight;
          const ty = effRest[ii + 1] + dy * inf.weight;
          const tz = effRest[ii + 2] + dz * inf.weight;
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
        for (let m = 0; m < constraints.length; m++) {
          const cn = constraints[m];
          const ai = cn.i * 3;
          const bi = cn.j * 3;
          const dx = pos[bi] - pos[ai];
          const dy = pos[bi + 1] - pos[ai + 1];
          const dz = pos[bi + 2] - pos[ai + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < 1e-6) continue;
          const stiffness = cn.bend ? 1 - BEND_COMPLIANCE : 1;
          const target = cn.rest * lenScale;
          const diff = ((dist - target) / dist) * 0.5 * stiffness;
          const ox = dx * diff;
          const oy = dy * diff;
          const oz = dz * diff;
          const aGrab = grabbedSet.has(cn.i);
          const bGrab = grabbedSet.has(cn.j);
          if (aGrab && bGrab) continue;
          if (aGrab) {
            pos[bi] -= ox * 2;
            pos[bi + 1] -= oy * 2;
            pos[bi + 2] -= oz * 2;
          } else if (bGrab) {
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

    if (geoRef.current) {
      const attr = geoRef.current.getAttribute("position") as THREE.BufferAttribute;
      (attr.array as Float32Array).set(pos);
      attr.needsUpdate = true;
      geoRef.current.computeVertexNormals();
    }

    if (groupRef.current) {
      groupRef.current.position.copy(f.ballPosition);
      const sc = Math.max(0, 1 - f.disposeProgress);
      groupRef.current.scale.setScalar(sc);
      groupRef.current.visible = sc > 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <primitive object={geometry} ref={geoRef} attach="geometry" />
        <shaderMaterial
          vertexShader={vertShader}
          fragmentShader={fragShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
