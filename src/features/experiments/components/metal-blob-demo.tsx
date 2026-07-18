import { Environment, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

// Drag state, read every frame by the blob and written by the pointer handlers on the
// wrapper. Refs (not state) so dragging never triggers a React re-render.
interface Spin {
  dragging: boolean;
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;
}

const SENS = 0.008; // radians per pixel dragged
const DAMP = 1.9; // how fast the fling bleeds off (higher = shorter)
const IDLE_Y = 0.16; // gentle drift when untouched, radians/second

function Blob({ spin }: { spin: RefObject<Spin> }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const s = spin.current;
    const dt = Math.min(delta, 1 / 30);

    if (s.dragging) {
      // Track the pointer 1:1 while held.
      g.rotation.y = s.rotY;
      g.rotation.x = THREE.MathUtils.clamp(s.rotX, -1, 1);
    } else {
      // Released: carry the fling, decay it, ease the tilt back to level.
      const decay = Math.exp(-DAMP * dt);
      s.rotY += (s.velY + IDLE_Y) * dt;
      s.rotX += s.velX * dt;
      s.velY *= decay;
      s.velX *= decay;
      s.rotX *= Math.exp(-0.9 * dt);
      g.rotation.y = s.rotY;
      g.rotation.x = s.rotX;
    }
  });

  return (
    <group ref={group} scale={0.45}>
      <Sphere args={[1, 200, 200]}>
        {/* Polished chrome: metalness 1 + near-zero roughness makes it a true mirror,
            reflecting the neutral studio below — clean liquid metal, no image. */}
        <MeshDistortMaterial
          color="#ffffff"
          metalness={1}
          roughness={0.13}
          envMapIntensity={1}
          distort={0.6}
          speed={3.2}
        />
      </Sphere>
    </group>
  );
}

// The chrome mirrors one CONTINUOUS gradient sphere (flat panels would show as hard
// blocks with black seams). Each palette is four colours, bottom → top, sampled at the
// fixed positions below; the studio slowly morphs from one palette to the next so the
// blob drifts through different satisfying gradients. No DOM/canvas, SSR-safe; no image.
type Palette = [number, number, number][];

const STOP_POS = [0, 0.45, 0.72, 1] as const;
const PALETTE_SPEED = 0.13; // palettes per second (~1 / this = seconds per gradient)

// The environment is a 2D equirect texture wrapped on the studio sphere: a vertical
// palette gradient with a soft-box highlight baked directly into it. Baking the
// highlight into the surface (rather than floating a light object) makes it read like a
// real window reflection sweeping across the metal — feathered, not a bulb or a streak.
const ENV_W = 240;
const ENV_H = 120;

const PALETTES: Palette[] = [
  [
    [46, 51, 60],
    [120, 130, 146],
    [196, 204, 216],
    [246, 248, 252],
  ], // silver blue
  [
    [58, 44, 28],
    [150, 110, 60],
    [214, 180, 120],
    [250, 240, 214],
  ], // champagne gold
  [
    [40, 34, 78],
    [96, 72, 168],
    [190, 140, 214],
    [246, 224, 240],
  ], // iris
  [
    [16, 54, 58],
    [40, 120, 120],
    [130, 200, 190],
    [232, 248, 242],
  ], // teal
  [
    [60, 28, 40],
    [150, 70, 96],
    [214, 140, 160],
    [250, 226, 232],
  ], // rose
  [
    [42, 30, 66],
    [128, 64, 132],
    [214, 110, 120],
    [250, 214, 180],
  ], // violet sunset
];

// Static highlight field (0..1), built once: one broad elongated soft-box plus a small
// secondary glint, both with a smooth Gaussian falloff so the edges feather out.
const HIGHLIGHT = (() => {
  const field = new Float32Array(ENV_W * ENV_H);
  const spots = [
    { u: 0.32, v: 0.72, ru: 0.16, rv: 0.06, gain: 1 }, // main soft-box, wide + short
    { u: 0.46, v: 0.5, ru: 0.05, rv: 0.05, gain: 0.35 }, // faint secondary glint
  ];
  for (let y = 0; y < ENV_H; y++) {
    for (let x = 0; x < ENV_W; x++) {
      const u = x / (ENV_W - 1);
      const v = y / (ENV_H - 1);
      let sum = 0;
      for (const s of spots) {
        const du = (u - s.u) / s.ru;
        const dv = (v - s.v) / s.rv;
        sum += s.gain * Math.exp(-(du * du + dv * dv));
      }
      field[y * ENV_W + x] = Math.min(sum, 1);
    }
  }
  return field;
})();

// Colour of one gradient row (v: 0 bottom → 1 top) from four blended stop colours.
function colorAtRow(v: number, cols: Palette): [number, number, number] {
  let i = 0;
  while (i < STOP_POS.length - 2 && v > STOP_POS[i + 1]) i++;
  const f = (v - STOP_POS[i]) / (STOP_POS[i + 1] - STOP_POS[i]);
  const a = cols[i];
  const b = cols[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

// Fill the 2D env: each row is the palette gradient, lifted toward white by the
// highlight field so the soft-box blends into the surface instead of sitting on it.
function writeEnv(data: Uint8Array, cols: Palette) {
  for (let y = 0; y < ENV_H; y++) {
    const [r, g, b] = colorAtRow(y / (ENV_H - 1), cols);
    for (let x = 0; x < ENV_W; x++) {
      const w = HIGHLIGHT[y * ENV_W + x];
      const o = (y * ENV_W + x) * 4;
      data[o] = r + (255 - r) * w;
      data[o + 1] = g + (255 - g) * w;
      data[o + 2] = b + (255 - b) * w;
      data[o + 3] = 255;
    }
  }
}

function Studio() {
  const data = useMemo(() => new Uint8Array(ENV_W * ENV_H * 4), []);
  const texture = useMemo(() => {
    const t = new THREE.DataTexture(data, ENV_W, ENV_H, THREE.RGBAFormat);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [data]);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, 1 / 30);
    const phase = elapsed.current * PALETTE_SPEED;
    const n = PALETTES.length;
    const a = PALETTES[Math.floor(phase) % n];
    const b = PALETTES[(Math.floor(phase) + 1) % n];
    const raw = phase - Math.floor(phase);
    const f = raw * raw * (3 - 2 * raw); // smoothstep for an eased crossfade
    const cols = a.map((c, k) => [
      c[0] + (b[k][0] - c[0]) * f,
      c[1] + (b[k][1] - c[1]) * f,
      c[2] + (b[k][2] - c[2]) * f,
    ]) as Palette;
    writeEnv(data, cols);
    texture.needsUpdate = true;
  });

  // frames={Infinity}: re-bake the env every frame so the drifting gradient (and the
  // highlight sweeping as the blob turns) shows in the reflection.
  return (
    <Environment frames={Infinity} resolution={128} background={false}>
      <mesh scale={60}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
      </mesh>
    </Environment>
  );
}

export function MetalBlob() {
  const spin = useRef<Spin>({ dragging: false, rotX: 0, rotY: 0, velX: 0, velY: 0 });
  const last = useMemo(() => ({ x: 0, y: 0, t: 0 }), []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    s.dragging = true;
    s.velX = 0;
    s.velY = 0;
    last.x = e.clientX;
    last.y = e.clientY;
    last.t = performance.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    if (!s.dragging) return;
    const now = performance.now();
    const dt = Math.max(now - last.t, 1) / 1000;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    s.rotY += dx * SENS;
    s.rotX += dy * SENS;
    // Velocity from the latest move so a paused pointer releases without a fling.
    s.velY = (dx * SENS) / dt;
    s.velX = (dy * SENS) / dt;
    last.x = e.clientX;
    last.y = e.clientY;
    last.t = now;
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    if (!s.dragging) return;
    s.dragging = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className="relative h-full w-full cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Canvas
        dpr={[1, 2]}
        // Measure the element's layout size, not its bounding rect — the open morph
        // CSS-scales the tile, and the rect would otherwise freeze the canvas at a
        // mid-animation size (blob stuck small in a corner).
        resize={{ offsetSize: true }}
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.NeutralToneMapping,
          powerPreference: "high-performance",
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{
          position: "absolute",
          inset: 0,
          filter: "drop-shadow(0 14px 26px rgba(15,20,28,0.20))",
        }}
      >
        <Suspense fallback={null}>
          <Studio />
          <Blob spin={spin} />
        </Suspense>
      </Canvas>
    </div>
  );
}
