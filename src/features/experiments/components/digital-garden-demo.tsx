import { useCallback, useEffect, useRef, useState } from "react";
import { ASSETS, drawGrassTuft, drawStem } from "./digital-garden-art";
import "./digital-garden-demo.css";

// A small garden of procedural pixel-art flowers, each a stem + head rooted in a grassy base. Every
// sprite is drawn onto a small grid, hard-thresholded, given a 1px black outline, then upscaled
// nearest-neighbour — so pixels stay sharp and pop. Heads frame-animate (petals shimmer), the bed
// grows in from the ground, and clicking a plant bursts it into its own pixels before a new one
// sprouts elsewhere. See digital-garden-art.ts for the drawing engine.

const PX = 1.6; // display px per source pixel (lower ⇒ finer pixels + thinner 1px outline)
const FRAMES = 4; // baked sprite frames per animated head
const PAD = 1; // 1px transparent margin so the outline never clips
const OUTLINE: [number, number, number] = [26, 18, 28]; // near-black
const GROUND = 27; // where stems are rooted, % up from the bottom

// deterministic RNG so the initial bed (and its poster) is identical every render
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const round2 = (v: number) => Math.round(v * 100) / 100;

// Snap anti-aliased alpha to hard on/off so upscaled edges stay crisp.
function crispen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] < 110 ? 0 : 255;
  ctx.putImageData(img, 0, 0);
}

// Dilate a 1px black ring around the silhouette (every transparent pixel touching an opaque one).
function outline(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const op = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) op[p] = d[p * 4 + 3] > 0 ? 1 : 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (op[p]) continue;
      if ((y > 0 && op[p - w]) || (y < h - 1 && op[p + w]) || (x > 0 && op[p - 1]) || (x < w - 1 && op[p + 1])) {
        const i = p * 4;
        d[i] = OUTLINE[0];
        d[i + 1] = OUTLINE[1];
        d[i + 2] = OUTLINE[2];
        d[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

function plantDims(name: string, headGh: number, stemGh: number) {
  const spec = ASSETS[name];
  const headGw = Math.max(1, Math.round(headGh * (spec.w / spec.h)));
  const overlap = Math.round(headGh * 0.16);
  const gw = headGw + 10 + PAD * 2; // room for leaves + outline
  const gh = stemGh + headGh - overlap + PAD * 2;
  return { spec, headGw, overlap, gw, gh };
}

// Render a whole plant (stem + head at `phase`) onto a fresh grid canvas, crisped + outlined.
function bakePlant(name: string, headGh: number, stemGh: number, seed: number, phase: number) {
  if (typeof document === "undefined") return null;
  const { spec, headGw, overlap, gw, gh } = plantDims(name, headGh, stemGh);
  const cv = document.createElement("canvas");
  cv.width = gw;
  cv.height = gh;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  const cx = gw / 2;
  const headBaseY = PAD + headGh - overlap;
  if (stemGh > 1) drawStem(ctx, cx, gh - PAD, cx, headBaseY, Math.max(2, Math.round(headGh * 0.1)), seed);
  ctx.save();
  ctx.translate(cx - headGw / 2, PAD);
  const k = headGh / spec.h;
  ctx.scale(k, k);
  spec.draw(ctx, phase);
  ctx.restore();
  crispen(ctx, gw, gh);
  outline(ctx, gw, gh);
  return cv;
}

type Plant = {
  id: number;
  name: string;
  x: number; // % (root, horizontal)
  bottom: number; // % up from base (root)
  stemLen: number; // px
  headH: number; // px
  flip: boolean;
  anim: string;
  swayDur: number;
  swayDelay: number;
  grow: number;
  fps: number;
  startFrame: number;
  seed: number;
  z: number;
};

const gridH = (headH: number) => Math.max(12, Math.min(44, Math.round(headH / PX)));
const gridStem = (stemLen: number) => Math.max(0, Math.round(stemLen / PX));

function PlantSprite({ plant }: { plant: Plant }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { name, headH, stemLen, seed, flip, fps, startFrame } = plant;
  const headGh = gridH(headH);
  const stemGh = gridStem(stemLen);
  const { gw, gh } = plantDims(name, headGh, stemGh);
  useEffect(() => {
    const cv = ref.current;
    const dctx = cv?.getContext("2d");
    if (!cv || !dctx) return;
    const reduce =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = ASSETS[name].anim && !reduce ? FRAMES : 1;
    const frames: HTMLCanvasElement[] = [];
    for (let f = 0; f < n; f++) {
      const c = bakePlant(name, headGh, stemGh, seed, f / n);
      if (c) frames.push(c);
    }
    if (!frames.length) return;
    let i = startFrame % frames.length;
    const paint = () => {
      dctx.clearRect(0, 0, gw, gh);
      dctx.drawImage(frames[i], 0, 0);
    };
    paint();
    if (frames.length <= 1) return;
    let raf = 0;
    let last = 0;
    const step = 1000 / fps;
    const loop = (t: number) => {
      if (t - last >= step) {
        last = t;
        i = (i + 1) % frames.length;
        paint();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [name, headGh, stemGh, seed, fps, startFrame, gw, gh]);
  return (
    <canvas
      ref={ref}
      width={gw}
      height={gh}
      style={{ width: gw * PX, height: gh * PX, transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden
    />
  );
}

function GrassTuft({ w, h, seed }: { w: number; h: number; seed: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const gw = Math.max(6, Math.round(w / PX));
  const gh = Math.max(6, Math.round(h / PX));
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    ctx.clearRect(0, 0, gw, gh);
    drawGrassTuft(ctx, gw, gh, seed);
    crispen(ctx, gw, gh);
    outline(ctx, gw, gh);
  }, [gw, gh, seed]);
  return <canvas ref={ref} width={gw} height={gh} style={{ width: gw * PX, height: gh * PX }} aria-hidden />;
}

const FLOWERS = [
  "rose_red", "rose_yellow", "rose_pink", "rose_blue",
  "gerbera_pink", "gerbera_red", "gerbera_orange", "gerbera_purple",
  "daisy_white", "sunflower", "tulip_red", "tulip_yellow", "tulip_purple",
  "five_blue", "five_orange", "calla_pink",
];
const ANIMS = ["sway", "bob", "pulse", "wiggle"];
const N_PLANTS = 44;

const grassTufts = (() => {
  const rand = rng(0x0da5e11);
  const out: { left: number; bottom: number; w: number; h: number; seed: number }[] = [];
  const n = 20;
  for (let i = 0; i < n; i++) {
    out.push({
      left: round2(3 + (i + 0.5) * (94 / n) + (rand() - 0.5) * 4),
      bottom: round2(GROUND - 3 + rand() * 4),
      w: Math.round(42 + rand() * 24),
      h: Math.round(26 + rand() * 18),
      seed: 0xa000 + i,
    });
  }
  return out;
})();

function makePlant(id: number, rand: () => number, cap?: (n: string) => number, counts?: Record<string, number>): Plant {
  let name = FLOWERS[(rand() * FLOWERS.length) | 0];
  if (cap && counts) {
    for (let t = 0; t < 24; t++) {
      const c = FLOWERS[(rand() * FLOWERS.length) | 0];
      if ((counts[c] ?? 0) < cap(c)) {
        counts[c] = (counts[c] ?? 0) + 1;
        name = c;
        break;
      }
    }
  }
  const stemLen = round2(28 + rand() * rand() * 138); // every plant has a stem; some much taller
  return {
    id,
    name,
    x: 0,
    bottom: round2(GROUND - 2 + rand() * 6),
    stemLen,
    headH: round2(24 + rand() * 20),
    flip: rand() < 0.5,
    anim: ANIMS[(rand() * ANIMS.length) | 0],
    swayDur: round2(2.6 + rand() * 2),
    swayDelay: round2(-rand() * 4),
    grow: round2((stemLen / 142) * 0.7),
    fps: 5 + ((rand() * 4) | 0),
    startFrame: (rand() * FRAMES) | 0,
    seed: (rand() * 1e9) | 0,
    z: 10,
  };
}

function buildInitialPlants(): Plant[] {
  const rand = rng(0x51ed2701);
  const counts: Record<string, number> = {};
  const cap = (n: string) => (n === "calla_pink" ? 1 : n.startsWith("tulip") ? 2 : 3);
  const list: Plant[] = [];
  for (let i = 0; i < N_PLANTS; i++) {
    const p = makePlant(i, rand, cap, counts);
    p.x = round2(4 + (i + 0.5) * (92 / N_PLANTS) + (rand() - 0.5) * 3.5);
    list.push(p);
  }
  // paint back-to-front: plants rooted higher up read as further back
  list.sort((a, b) => b.bottom - a.bottom);
  list.forEach((p, i) => (p.z = 10 + i));
  return list;
}

// A snipped plant: the top piece (head + upper stem) tips off the cut and falls; the stub fades.
type Cut = {
  id: number;
  left: number;
  top: number;
  w: number;
  topCv: HTMLCanvasElement;
  botCv: HTMLCanvasElement;
  cutY: number; // display px from the box top where the stem was cut
  driftX: number;
  rot: number;
  fallY: number;
};

function CutPiece({ cut }: { cut: Cut }) {
  const topRef = useRef<HTMLCanvasElement | null>(null);
  const botRef = useRef<HTMLCanvasElement | null>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    topRef.current?.getContext("2d")?.drawImage(cut.topCv, 0, 0);
    botRef.current?.getContext("2d")?.drawImage(cut.botCv, 0, 0);
    // let the pieces paint one frame, then trigger the fall transition
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setGo(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [cut]);
  return (
    <div className="dg-cut" style={{ left: cut.left, top: cut.top, width: cut.w }}>
      <canvas
        ref={topRef}
        width={cut.topCv.width}
        height={cut.topCv.height}
        className="dg-cut-top"
        style={{
          width: cut.w,
          height: cut.cutY,
          transformOrigin: "50% 100%",
          transform: go ? `translate(${cut.driftX}px, ${cut.fallY}px) rotate(${cut.rot}deg)` : "none",
          opacity: go ? 0 : 1,
          transition: "transform 0.62s cubic-bezier(0.45, 0, 0.9, 0.5), opacity 0.5s ease-in 0.18s",
        }}
      />
      <canvas
        ref={botRef}
        width={cut.botCv.width}
        height={cut.botCv.height}
        className="dg-cut-bot"
        style={{
          top: cut.cutY,
          width: cut.w,
          height: cut.botCv.height * PX,
          opacity: go ? 0 : 1,
          transition: "opacity 0.35s ease 0.3s",
        }}
      />
      <div className="dg-cut-flash" style={{ top: cut.cutY - 1, width: cut.w, opacity: go ? 0 : 1 }} />
    </div>
  );
}

export const DigitalGarden = () => {
  const [plants, setPlants] = useState<Plant[]>(buildInitialPlants);
  const [cuts, setCuts] = useState<Cut[]>([]);
  const nextId = useRef(1000);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const captured = timers.current;
    return () => captured.forEach(clearTimeout);
  }, []);

  // Snip the plant: split its baked sprite at a point on the stem into a falling top + a stub.
  const makeCut = useCallback((plant: Plant, canvasEl: HTMLCanvasElement | null): Cut | null => {
    const cont = containerRef.current;
    if (!cont || !canvasEl) return null;
    const headGh = gridH(plant.headH);
    const stemGh = gridStem(plant.stemLen);
    const { gw, gh } = plantDims(plant.name, headGh, stemGh);
    const snap = bakePlant(plant.name, headGh, stemGh, plant.seed, 0);
    if (!snap) return null;
    const cr = cont.getBoundingClientRect();
    const br = canvasEl.getBoundingClientRect();
    const rootX = (br.left + br.right) / 2 - cr.left; // stable under the sway rotation
    const rootBottom = br.bottom - cr.top;
    const w = gw * PX;
    const h = gh * PX;
    // cut somewhere on the stem, below the head
    const headBottomRow = headGh - Math.round(headGh * 0.16) + PAD;
    const cutRow = Math.max(headBottomRow + 1, Math.min(gh - 2, headBottomRow + 1 + Math.round((0.15 + Math.random() * 0.45) * stemGh)));
    const topCv = document.createElement("canvas");
    topCv.width = gw;
    topCv.height = cutRow;
    const botCv = document.createElement("canvas");
    botCv.width = gw;
    botCv.height = gh - cutRow;
    const tctx = topCv.getContext("2d");
    const bctx = botCv.getContext("2d");
    if (!tctx || !bctx) return null;
    if (plant.flip) {
      tctx.translate(gw, 0);
      tctx.scale(-1, 1);
      bctx.translate(gw, 0);
      bctx.scale(-1, 1);
    }
    tctx.drawImage(snap, 0, 0, gw, cutRow, 0, 0, gw, cutRow);
    bctx.drawImage(snap, 0, cutRow, gw, gh - cutRow, 0, 0, gw, gh - cutRow);
    const dir = Math.random() < 0.5 ? -1 : 1;
    return {
      id: nextId.current++,
      left: rootX - w / 2,
      top: rootBottom - h,
      w,
      topCv,
      botCv,
      cutY: cutRow * PX,
      driftX: dir * (14 + Math.random() * 34),
      rot: dir * (32 + Math.random() * 55),
      fallY: 90 + Math.random() * 80,
    };
  }, []);

  const onPlantClick = useCallback(
    (plant: Plant) => (e: React.MouseEvent<HTMLDivElement>) => {
      const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cut = reduce ? null : makeCut(plant, e.currentTarget.querySelector("canvas"));
      setPlants((ps) => ps.filter((p) => p.id !== plant.id));
      if (cut) {
        setCuts((cs) => [...cs, cut]);
        const rm = setTimeout(() => {
          setCuts((cs) => cs.filter((c) => c.id !== cut.id));
          timers.current.delete(rm);
        }, 850);
        timers.current.add(rm);
      }
      // a fresh plant sprouts elsewhere shortly after
      const tm = setTimeout(() => {
        setPlants((ps) => {
          const p = makePlant(nextId.current++, Math.random);
          p.x = round2(4 + Math.random() * 92);
          p.grow = 0;
          p.z = 60;
          return [...ps, p];
        });
        timers.current.delete(tm);
      }, 560);
      timers.current.add(tm);
    },
    [makeCut],
  );

  return (
    <div ref={containerRef} className="digital-garden" role="img" aria-label="A small pixel-art flower garden">
      {grassTufts.map((g, i) => (
        <div key={`g${i}`} className="dg-grass" style={{ left: `${g.left}%`, bottom: `${g.bottom}%` }}>
          <div className="dg-grow dg-grow-grass">
            <GrassTuft w={g.w} h={g.h} seed={g.seed} />
          </div>
        </div>
      ))}

      {plants.map((p) => (
        <div
          key={p.id}
          className="dg-plant"
          style={{ left: `${p.x}%`, bottom: `${p.bottom}%`, zIndex: p.z }}
          onClick={onPlantClick(p)}
        >
          <div className="dg-grow" style={{ animationDelay: `${p.grow}s` }}>
            <div
              className={`dg-bloom-anim dg-anim-${p.anim}`}
              style={{ animationDuration: `${p.swayDur}s`, animationDelay: `${p.swayDelay}s` }}
            >
              <PlantSprite plant={p} />
            </div>
          </div>
        </div>
      ))}

      {cuts.map((c) => (
        <CutPiece key={c.id} cut={c} />
      ))}
    </div>
  );
};
