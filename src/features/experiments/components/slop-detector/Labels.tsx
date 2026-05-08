import { useEffect, useMemo, useState } from "react";
import { CABLE_ORANGE } from "./lib/palette";
import { loadFont, makeTextTexture } from "./lib/textTexture";

const FONT_URL = "/fonts/commit-mono/commit-mono-regular.otf";
const Y = 0.0188;
const DARK = "#13231a";
const FONT_PX = 64;

type Label = {
  text: string;
  pos: [number, number, number];
  worldHeight: number;
  color?: string;
};

const LABELS: Label[] = [
  { text: "slop detector", pos: [-0.025, Y, -0.0245], worldHeight: 0.0028 },
  { text: "speaker", pos: [0.020, Y, -0.0265], worldHeight: 0.0022 },
  { text: "scan · radiation", pos: [-0.025, Y, -0.0030], worldHeight: 0.0017 },
  { text: "slop / h", pos: [-0.025, Y, +0.0060], worldHeight: 0.0018, color: CABLE_ORANGE },
  { text: "pwr", pos: [-0.030, Y, +0.0205], worldHeight: 0.0024 },
  { text: "scan", pos: [-0.012, Y, +0.0205], worldHeight: 0.0024 },
  { text: "amp +", pos: [0.008, Y, +0.0205], worldHeight: 0.0024 },
  { text: "amp −", pos: [0.026, Y, +0.0205], worldHeight: 0.0024 },
  { text: "model zero · mk i", pos: [0, Y, +0.0277], worldHeight: 0.0016, color: CABLE_ORANGE },
  { text: "no. 001", pos: [-0.043, Y, +0.0277], worldHeight: 0.0014 },
  { text: "ai grade", pos: [0.041, Y, +0.0277], worldHeight: 0.0014 },
];

function LabelMesh({ label, ready }: { label: Label; ready: boolean }) {
  const tex = useMemo(() => {
    if (!ready) return null;
    return makeTextTexture(label.text, FONT_PX, label.color ?? DARK, 1.5);
  }, [label.text, label.color, label.worldHeight, ready]);

  if (!tex) return null;
  const w = tex.aspect * label.worldHeight;
  const h = label.worldHeight;
  return (
    <mesh
      position={label.pos}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={2}
      castShadow={false}
      receiveShadow={false}
    >
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={tex.texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function Labels() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    loadFont(FONT_URL).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <>
      {LABELS.map((l, i) => (
        <LabelMesh key={i} label={l} ready={ready} />
      ))}
    </>
  );
}
