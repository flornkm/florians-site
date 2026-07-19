import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

/* A photo run through a column-wise pixel sort: every vertical strip of the image is split at its
   hard brightness edges and each segment is re-ordered by luminance, so the image melts into long
   vertical streaks — line art on a grid of columns. A baked-in RGB split gives the chromatic
   fringe, a per-frame "lighter" ghost animates it, and a scan sweep reveals the whole thing on
   load / on click (which also re-scrambles the streaks).

   Kept deliberately low-res (COLS×ROWS) and upscaled with smoothing off, so the columns read as a
   crisp grid rather than a blurry photo — the sort runs once per seed, never per frame. */

const SRC = "/images/experiments/starry-mountains.webp";

// A 3:4 buffer the source is cover-cropped into, kept high-res so the column sort reads as smooth
// vertical smear rather than blocky pixels. The canvas itself is sized to its real device pixels
// (see the draw loop), so these layers upscale straight to native resolution — no retina downscale
// blur that would smear the fine columns away on a phone.
const COLS = 240;
const ROWS = 320;

const POSTER = "#ff4326"; // the red-orange field the streaks bleed into, like the reference card

// Smear = how far a run of similar-brightness pixels reaches before an edge cuts it. A bigger edge
// threshold merges more into one segment, so the streaks get longer. Locked to the "hard" look.
const EDGE = 44;

const CAPTIONS = ["maker", "builder", "explorer", "wanderer"];

const CHROMA = 2; // horizontal RGB offset baked into the buffer, in low-res pixels
const MORPH_MS = 1100; // the untouched photo crossfades into the sorted line-art over this long

const idx = (x: number, y: number) => (y * COLS + x) * 4;

// One column-wise pixel sort into `out`. Walk each column top-to-bottom, cut a new segment wherever
// the brightness jump between neighbours exceeds `edge` (+ a little per-column seed jitter so a
// re-seed reshuffles the streaks), and sort each segment's pixels by brightness. `bri` is the
// source luminance; pixels are copied from `src` so colour rides along with the sort key.
const sortColumns = (
  src: Uint8ClampedArray,
  bri: Float32Array,
  out: Uint8ClampedArray,
  edge: number,
  seed: number,
) => {
  out.set(src);
  const order: number[] = [];

  for (let x = 0; x < COLS; x++) {
    // Deterministic per-column jitter (hash of x+seed) — keeps re-seeds varied without Math.random
    // leaking into the buffer identity we memoise on.
    const jitter = (Math.sin((x + 1) * 12.9898 + seed * 78.233) * 43758.5453) % 1;
    const localEdge = edge * (0.75 + 0.5 * Math.abs(jitter));

    let start = 0;
    const flush = (end: number) => {
      if (end - start > 1) {
        order.length = 0;
        for (let y = start; y < end; y++) order.push(y);
        order.sort((a, b) => bri[a * COLS + x] - bri[b * COLS + x]);
        for (let k = 0; k < order.length; k++) {
          const from = idx(x, order[k]);
          const to = idx(x, start + k);
          out[to] = src[from];
          out[to + 1] = src[from + 1];
          out[to + 2] = src[from + 2];
          out[to + 3] = src[from + 3];
        }
      }
      start = end;
    };

    for (let y = 1; y < ROWS; y++) {
      if (Math.abs(bri[y * COLS + x] - bri[(y - 1) * COLS + x]) > localEdge) flush(y);
    }
    flush(ROWS);
  }
};

// Build the three offscreen layers the render loop composites: the full-colour base plus red-only
// and blue-only copies (alpha preserved) that get drawn back at ±CHROMA under "lighter" for the
// aberration. Near-white pixels are keyed to transparent here so the poster colour shows through
// the background instead of a white box.
const buildLayers = (out: Uint8ClampedArray) => {
  const base = new ImageData(COLS, ROWS);
  const red = new ImageData(COLS, ROWS);
  const blue = new ImageData(COLS, ROWS);
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const bg = r > 236 && g > 236 && b > 236 ? 0 : 255;
    base.data[i] = r;
    base.data[i + 1] = g;
    base.data[i + 2] = b;
    base.data[i + 3] = bg;
    red.data[i] = r;
    red.data[i + 3] = bg;
    blue.data[i + 2] = b;
    blue.data[i + 3] = bg;
  }
  const toCanvas = (data: ImageData) => {
    const c = document.createElement("canvas");
    c.width = COLS;
    c.height = ROWS;
    c.getContext("2d")?.putImageData(data, 0, 0);
    return c;
  };
  return { base: toCanvas(base), red: toCanvas(red), blue: toCanvas(blue) };
};

type Layers = ReturnType<typeof buildLayers>;

export const LinePortrait = () => {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [seed, setSeed] = useState(0);
  const [caption, setCaption] = useState(0);
  // Hue rotation lives in React state so it drives a CSS filter on the <canvas> — Canvas2D's own
  // ctx.filter is unsupported on iOS Safari before 17, but the CSS filter works everywhere.
  const [hue, setHue] = useState(0);

  // Source luminance + colour, read once from the decoded image.
  const srcRef = useRef<{ data: Uint8ClampedArray; bri: Float32Array } | null>(null);
  const [ready, setReady] = useState(false);

  // The untouched cropped photo, the sorted layers, and a morph clock — all read by the rAF loop
  // without re-rendering React.
  const origRef = useRef<HTMLCanvasElement | null>(null);
  const layersRef = useRef<Layers | null>(null);
  const morphStartRef = useRef(0);

  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.src = SRC;
    let cancelled = false;
    img.onload = () => {
      if (cancelled) return;
      const c = document.createElement("canvas");
      c.width = COLS;
      c.height = ROWS;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      // Center cover-crop the source to the column grid's 3:4, whatever the source aspect.
      const targetAR = COLS / ROWS;
      const imgAR = img.width / img.height;
      const sw = imgAR > targetAR ? img.height * targetAR : img.width;
      const sh = imgAR > targetAR ? img.height : img.width / targetAR;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, COLS, ROWS);
      const data = ctx.getImageData(0, 0, COLS, ROWS).data;
      const bri = new Float32Array(COLS * ROWS);
      for (let i = 0; i < bri.length; i++) {
        bri[i] = (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3;
      }
      srcRef.current = { data, bri };
      origRef.current = c; // the cropped photo, kept as the crossfade's starting frame
      setReady(true);
    };
    return () => {
      cancelled = true;
    };
  }, []);

  // Recompute the sort whenever the source or seed changes, then (re)start the reveal.
  useEffect(() => {
    const src = srcRef.current;
    if (!src) return;
    const out = new Uint8ClampedArray(src.data.length);
    sortColumns(src.data, src.bri, out, EDGE, seed);
    layersRef.current = buildLayers(out);
    // Each click (seed bump) also spins the streaks to a new hue; seed 0 keeps the true colours.
    setHue((seed * 67) % 360);
    // First open dissolves from the photo (-1 = start next frame); every click after that switches
    // instantly (-Infinity makes the morph read as already-complete on the very next frame).
    morphStartRef.current = seed === 0 ? -1 : Number.NEGATIVE_INFINITY;
  }, [ready, seed]);

  // The draw loop: the untouched photo, with the sorted line-art crossfading in on top of it.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const W = COLS * SCALE;
    const H = ROWS * SCALE;
    let raf = 0;

    const frame = (t: number) => {
      const layers = layersRef.current;
      const orig = origRef.current;
      if (layers && orig) {
        if (morphStartRef.current === -1) morphStartRef.current = t;
        const p = reduced ? 1 : Math.min(1, (t - morphStartRef.current) / MORPH_MS);
        // smootherstep — eases both in and out so the dissolve has no hard start or stop.
        const a = p * p * p * (p * (p * 6 - 15) + 10);

        // Subtle life once settled: the RGB split breathes, plus a hair of vertical jitter.
        const drift = reduced ? 0 : (0.5 + 0.5 * Math.sin(t / 900)) * CHROMA * SCALE;
        const jig = reduced ? 0 : Math.sin(t / 130) * 0.6 * SCALE;

        ctx.imageSmoothingEnabled = true;
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.filter = "none";
        ctx.clearRect(0, 0, W, H);

        // Start frame: the real photo. It stays underneath and the line-art dissolves over it.
        ctx.drawImage(orig, 0, 0, W, H);

        if (a > 0) {
          const hue = hueRef.current;
          ctx.filter = hue ? `hue-rotate(${hue}deg) saturate(1.15)` : "none";
          ctx.globalAlpha = a;
          ctx.drawImage(layers.base, 0, jig, W, H);
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = a * 0.9;
          ctx.drawImage(layers.red, drift, jig, W, H);
          ctx.drawImage(layers.blue, -drift, jig, W, H);
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 1;
          ctx.filter = "none";
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [ready, reduced]);

  // Cycle the caption chip like burned-in subtitles.
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setCaption((c) => (c + 1) % CAPTIONS.length), 1700);
    return () => clearInterval(t);
  }, [reduced]);

  const reglitch = useCallback(() => setSeed((s) => s + 1), []);

  return (
    <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        onClick={reglitch}
        aria-label="Re-scramble and recolour the image"
        className="group relative h-[40%] max-h-[17rem] min-h-[8rem] w-auto max-w-full cursor-pointer overflow-hidden outline-none transition-transform duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-primary"
        style={{ aspectRatio: "3 / 4", backgroundColor: POSTER, containerType: "inline-size" }}
      >
        <canvas
          ref={canvasRef}
          width={COLS * SCALE}
          height={ROWS * SCALE}
          className="absolute inset-0 h-full w-full select-none"
        />

        {/* Burned-in subtitle chip, bottom-left like the reference. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[14%] flex justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={caption}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="rounded-[3px] bg-black px-2.5 py-1 font-sans text-[clamp(1.25rem,6cqw,2rem)] font-semibold leading-tight tracking-[-0.02em] text-white"
            >
              {CAPTIONS[caption]}
            </motion.span>
          </AnimatePresence>
        </div>
      </button>
    </div>
  );
};
