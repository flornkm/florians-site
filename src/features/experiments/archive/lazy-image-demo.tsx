import { RangeSlider } from "@/components/ui/range-slider";
import { animate, motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef, useState } from "react";

const IMAGE_SRC = "/images/experiments/office.webp";
const LORES_WIDTH = 18;
const MAX_WIDTH = 512;
const PLAY_DURATION = 1.8;
const EASE = [0.22, 1, 0.36, 1] as const;

function formatBytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export const LazyImage = () => {
  const progress = useMotionValue(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [sizes, setSizes] = useState<{ low: string; full: string } | null>(null);
  const [aspect, setAspect] = useState<number | null>(null);

  const redraw = (p: number) => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const eased = p * p;
    const targetW = Math.round(LORES_WIDTH + (MAX_WIDTH - LORES_WIDTH) * eased);
    const targetH = Math.round((img.height / img.width) * targetW);
    if (canvas.width !== targetW) canvas.width = targetW;
    if (canvas.height !== targetH) canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetW, targetH);
  };

  useMotionValueEvent(progress, "change", (v) => {
    if (sliderRef.current && document.activeElement !== sliderRef.current) {
      sliderRef.current.value = String(v);
    }
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      redraw(progress.get());
    });
  });

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = IMAGE_SRC;
    img.onload = () => {
      if (ignore) return;
      imgRef.current = img;
      setAspect(img.width / img.height);
      redraw(progress.get());

      const lowCanvas = document.createElement("canvas");
      const lowH = Math.round((img.height / img.width) * LORES_WIDTH);
      lowCanvas.width = LORES_WIDTH;
      lowCanvas.height = lowH;
      const lowCtx = lowCanvas.getContext("2d");
      if (lowCtx) {
        lowCtx.drawImage(img, 0, 0, LORES_WIDTH, lowH);
        const dataUrl = lowCanvas.toDataURL("image/jpeg", 0.5);
        const base64 = dataUrl.split(",")[1] ?? "";
        const lowBytes = Math.round(base64.length * 0.75);
        setSizes((prev) => ({
          low: formatBytes(lowBytes),
          full: prev?.full ?? "…",
        }));
      }
    };
    fetch(IMAGE_SRC, { signal: controller.signal })
      .then((r) => r.blob())
      .then((b) => {
        if (ignore) return;
        setSizes((prev) => ({
          low: prev?.low ?? "…",
          full: formatBytes(b.size),
        }));
      })
      .catch(() => {});
    return () => {
      ignore = true;
      controller.abort();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePlay = () => {
    if (playing) return;
    setPlaying(true);
    progress.set(0);
    if (sliderRef.current) sliderRef.current.value = "0";
    animate(progress, 1, {
      duration: PLAY_DURATION,
      ease: EASE,
      onUpdate: (v) => {
        if (sliderRef.current) sliderRef.current.value = String(v);
      },
      onComplete: () => setPlaying(false),
    });
  };

  return (
    <div className="flex flex-col gap-16 items-center justify-center w-full h-full px-6 py-8">
      <div className="w-40 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          aria-label="Office"
          className="max-w-full max-h-full"
          style={{
            imageRendering: "pixelated",
            aspectRatio: aspect ?? undefined,
            width: aspect ? "100%" : undefined,
            height: aspect ? "auto" : undefined,
          }}
        />
      </div>

      <div className="flex items-center gap-3 w-full max-w-[280px]">
        <motion.button
          type="button"
          aria-label="Play"
          onClick={handlePlay}
          disabled={playing}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 22, mass: 0.6 }}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-tertiary cursor-pointer bg-transparent transition-[background-color] duration-150 hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <svg width="12" height="14" viewBox="0 0 6 7" fill="none" className="-mr-0.5">
            <path
              d="M5.25 3.06699C5.58333 3.25944 5.58333 3.74056 5.25 3.93301L0.749999 6.53109C0.416666 6.72354 -3.05236e-07 6.48298 -2.88411e-07 6.09808L-6.128e-08 0.901923C-4.44555e-08 0.517023 0.416666 0.276461 0.75 0.468911L5.25 3.06699Z"
              fill="currentColor"
            />
          </svg>
        </motion.button>
        <span className="text-xs text-quaternary shrink-0 select-none tabular-nums">
          {sizes?.low ?? "…"}
        </span>
        <RangeSlider
          ref={sliderRef}
          min={0}
          max={1}
          step={0.001}
          defaultValue={0}
          disabled={playing}
          onChange={(e) => progress.set(parseFloat(e.currentTarget.value))}
        />
        <span className="text-xs text-quaternary shrink-0 select-none tabular-nums">
          {sizes?.full ?? "…"}
        </span>
      </div>
    </div>
  );
};
