import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { drawDotText } from "./lib/dotmatrix";
import { formatCps } from "./lib/reading";
import { useStore } from "./lib/store";

const W = 384;
const H = 132;

const SCREEN_POS: [number, number, number] = [-0.025, 0.01865, -0.012];
const SCREEN_SIZE: [number, number] = [0.03, 0.011];
const DOME_OVERHANG = 0.0018;
const DOME_RISE = 0.0024;

function makeDomeGeometry(width: number, height: number, rise: number) {
  const segs = 48;
  const geom = new THREE.PlaneGeometry(width, height, segs, segs);
  const pos = geom.attributes.position;
  const halfW = width / 2;
  const halfH = height / 2;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const u = x / halfW;
    const v = y / halfH;
    const r2 = Math.max(0, 1 - u * u * 0.78 - v * v * 0.94);
    const z = Math.sqrt(r2) * rise;
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

export function Display({ hidden }: { hidden: THREE.Object3D | null }) {
  if (hidden) hidden.visible = false;

  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  }, []);
  const ctx = useMemo(() => canvas.getContext("2d")!, [canvas]);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = 4;
    return t;
  }, [canvas]);

  const lastDraw = useRef(0);
  const lastVal = useRef(-1);
  const lastPowered = useRef<boolean | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (t - lastDraw.current < 0.1) return;
    lastDraw.current = t;
    const state = useStore.getState();
    const reading = state.reading;
    const powered = state.powered;
    const cps = formatCps(reading);
    const numeric = parseInt(cps, 10);
    if (numeric === lastVal.current && powered === lastPowered.current) return;
    lastVal.current = numeric;
    lastPowered.current = powered;

    ctx.fillStyle = "#040605";
    ctx.fillRect(0, 0, W, H);

    if (!powered) {
      ctx.globalCompositeOperation = "lighter";
      const sweep = ctx.createLinearGradient(0, 0, W * 0.7, H * 0.85);
      sweep.addColorStop(0, "rgba(255, 255, 255, 0.32)");
      sweep.addColorStop(0.4, "rgba(255, 255, 255, 0.06)");
      sweep.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = sweep;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      texture.needsUpdate = true;
      return;
    }

    ctx.fillStyle = "#070b0a";
    ctx.fillRect(0, 0, W, H);

    const cell = 10;
    const textW = 4 * (cell * 5) + 3 * (cell * 0.36);
    const textX = W - textW - 22;
    const textY = (H - cell * 7) / 2;
    drawDotText(ctx, cps, textX, textY, cell, "#f4f6e8", "#0e1614");

    ctx.fillStyle = "#7d8a72";
    ctx.font = "700 14px ui-monospace, Menlo, monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText("CPS", 16, 12);
    ctx.fillText("μSv·h⁻¹", 16, H - 22);

    const bars = Math.round(reading * 16);
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = i < bars ? "#f4f6e8" : "#1e2724";
      ctx.fillRect(16 + i * 7, H / 2 - 4, 4, 8);
    }

    ctx.globalCompositeOperation = "lighter";
    const sweep = ctx.createLinearGradient(0, 0, W * 0.7, H * 0.85);
    sweep.addColorStop(0, "rgba(255, 255, 255, 0.42)");
    sweep.addColorStop(0.35, "rgba(255, 255, 255, 0.10)");
    sweep.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = sweep;
    ctx.fillRect(0, 0, W, H);

    const radial = ctx.createRadialGradient(W * 0.22, H * 0.28, 2, W * 0.22, H * 0.28, W * 0.42);
    radial.addColorStop(0, "rgba(255, 255, 255, 0.55)");
    radial.addColorStop(0.4, "rgba(255, 255, 255, 0.05)");
    radial.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, W, H);

    const edge = ctx.createLinearGradient(W, H, W * 0.65, H * 0.5);
    edge.addColorStop(0, "rgba(255, 255, 255, 0.18)");
    edge.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "source-over";

    texture.needsUpdate = true;
  });

  const domeGeom = useMemo(
    () =>
      makeDomeGeometry(SCREEN_SIZE[0] + DOME_OVERHANG, SCREEN_SIZE[1] + DOME_OVERHANG, DOME_RISE),
    [],
  );

  return (
    <>
      <mesh position={SCREEN_POS} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={SCREEN_SIZE} />
        <meshStandardMaterial
          map={texture}
          emissive="#cfd6c4"
          emissiveMap={texture}
          emissiveIntensity={0.6}
          roughness={0.35}
          metalness={0}
          toneMapped={false}
        />
      </mesh>
      <mesh
        position={[SCREEN_POS[0], SCREEN_POS[1] + 0.0004, SCREEN_POS[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={domeGeom}
        castShadow={false}
        receiveShadow={false}
      >
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.32}
          roughness={0}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          ior={1.55}
          transmission={0}
          envMapIntensity={5.5}
          reflectivity={0.95}
          specularIntensity={1}
        />
      </mesh>
    </>
  );
}
