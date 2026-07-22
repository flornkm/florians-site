import { VITRINES, type Vitrine } from "@/features/experiments/components/arch-vitrines-art";
import { useEffect, useRef } from "react";
import "./arch-vitrines-demo.css";

/* Two woodcut line-art plates set into arched vitrines, like specimens in a museum niche: an
   indigo ink outline framing the drawing. The ink "boils" continuously — the etching looks
   re-drawn by hand, frame by frame, like a boiling line in hand-drawn animation.
   The etchings never enter the DOM: each plate rasterises three differently-seeded variants of
   its SVG (rough-ink filter baked in) to bitmaps once, off-DOM, then blits them onto one small
   canvas on the boiling-line cadence. Live filtered SVG layers made the whole drawer janky —
   six of them had to be composited under its slide transform; a per-plate canvas blit is a
   fixed-cost bitmap copy every 110ms, nothing more. */

const BOIL_FRAMES = [0, 1, 2];
const BOIL_FRAME_MS = 110;

// Raster height in device px — covers the largest the plate renders (desktop dialog ~250 CSS px
// at 2x, mobile ~150 CSS px at 3x); the canvas is CSS-scaled with object-contain from there.
const RASTER_HEIGHT = 768;

// Each variant needs its own distortion: suffix the filter ids (three copies of one plate would
// otherwise all resolve url(#…) to the same filter) and shift every noise seed.
const frameSvg = (svg: string, frame: number) =>
  svg
    .replace(/(id="|url\(#)([kr]-ink)/g, (_, prefix, name) => `${prefix}${name}-f${frame}`)
    .replace(/seed="(\d+)"/g, (_, seed) => `seed="${(Number(seed) + frame * 37) % 97}"`);

const viewBoxSize = (svg: string): [number, number] => {
  const m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  return m ? [Number(m[1]), Number(m[2])] : [5, 6];
};

const PLATES = VITRINES.map((vitrine) => ({
  vitrine,
  frames: BOIL_FRAMES.map((frame) => frameSvg(vitrine.svg, frame)),
  size: viewBoxSize(vitrine.svg),
}));

// Sparks twinkling in the niche; offset per plate so the two don't twinkle in unison.
const SPARKS = [
  { top: "22%", left: "22%", size: 9, delay: "0s" },
  { top: "46%", left: "78%", size: 7, delay: "1s" },
  { top: "76%", left: "34%", size: 8, delay: "0.5s" },
];

// A four-point sparkle with concave sides — the same star that's scratched into the etchings.
const SPARK_PATH = "M8 0C8 4.6 11.4 8 16 8C11.4 8 8 11.4 8 16C8 11.4 4.6 8 0 8C4.6 8 8 4.6 8 0Z";

interface PlateProps {
  vitrine: Vitrine;
  frames: string[];
  size: [number, number];
  sparkOffset: number;
}

function Plate({ vitrine, frames, size, sparkOffset }: PlateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let bitmaps: HTMLImageElement[] | null = null;
    let interval: number | null = null;
    let visible = false;
    let cancelled = false;
    const urls: string[] = [];

    const [w, h] = size;
    canvas.height = RASTER_HEIGHT;
    canvas.width = Math.round((w / h) * RASTER_HEIGHT);

    let frame = 0;
    const draw = () => {
      if (!bitmaps) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmaps[frame], 0, 0, canvas.width, canvas.height);
    };

    const stopLoop = () => {
      if (interval === null) return;
      clearInterval(interval);
      interval = null;
    };
    // The drawer keeps the last experiment mounted after closing, so only tick while on screen.
    const startLoop = () => {
      if (interval !== null || !bitmaps || !visible) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      interval = window.setInterval(() => {
        frame = (frame + 1) % BOIL_FRAMES.length;
        draw();
      }, BOIL_FRAME_MS);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startLoop();
      else stopLoop();
    });
    observer.observe(canvas);

    const build = async () => {
      // currentColor inside an <img> resolves against the svg root, not the page — bake the
      // arch's ink (theme-resolved) onto the root, and raster at the canvas's device size.
      const ink = getComputedStyle(canvas).color;
      const loaded = await Promise.all(
        frames.map((svg) => {
          const sized = svg.replace(
            "<svg ",
            `<svg width="${canvas.width}" height="${canvas.height}" color="${ink}" `,
          );
          const url = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
          urls.push(url);
          const img = new Image();
          img.src = url;
          return img.decode().then(() => img);
        }),
      );
      if (cancelled) return;
      bitmaps = loaded;
      draw();
      startLoop();
    };

    // Cleanup revokes the blob URLs mid-decode (StrictMode remounts, fast unmounts), which
    // rejects decode() — expected then, worth surfacing otherwise.
    const safeBuild = () =>
      build().catch((error: unknown) => {
        if (!cancelled) console.error(error);
      });

    safeBuild();
    // The ink is baked into the rasters, so a live theme flip needs a rebuild.
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const rebuild = () => {
      bitmaps = null;
      safeBuild();
    };
    scheme.addEventListener("change", rebuild);

    return () => {
      cancelled = true;
      scheme.removeEventListener("change", rebuild);
      observer.disconnect();
      stopLoop();
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [frames, size]);

  return (
    <div
      // Width-driven on the narrow mobile sheet so two arches always fit across; height-driven
      // on the wide desktop dialog. Only ever one dimension is fixed, so the 5/6 shape holds.
      className="av-vitrine w-[42%] max-w-[9rem] md:h-[42%] md:w-auto md:max-w-none"
      style={{ aspectRatio: "5 / 6" }}
    >
      <div className="size-full overflow-hidden rounded-t-full border-[1.5px] border-current p-2.5">
        <canvas ref={canvasRef} className="size-full object-contain" aria-hidden />
      </div>
      {SPARKS.map((spark) => (
        <svg
          key={`${vitrine.key}-${spark.top}-${spark.left}`}
          className="av-spark"
          viewBox="0 0 16 16"
          aria-hidden
          style={{
            top: spark.top,
            left: spark.left,
            width: spark.size,
            height: spark.size,
            animationDelay: `calc(${spark.delay} + ${sparkOffset}s)`,
          }}
        >
          <path d={SPARK_PATH} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

export const ArchVitrines = () => (
  <div className="arch-vitrines absolute inset-0 flex items-center justify-center gap-4 p-4 text-[#463996] md:gap-10 md:p-6 dark:text-[#a6a1ea]">
    {PLATES.map(({ vitrine, frames, size }, i) => (
      <Plate
        key={vitrine.key}
        vitrine={vitrine}
        frames={frames}
        size={size}
        sparkOffset={i * 0.45}
      />
    ))}
  </div>
);
