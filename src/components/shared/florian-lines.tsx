import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  parseWordmarkRects,
  WORDMARK_SPACING,
  WORDMARK_STROKE,
  WORDMARK_VIEW_H,
} from "./florian-kiem-path";

interface FlorianLinesProps {
  className?: string;
}

// Keep only "Florian" — the gap before "Kiem" sits between x≈907 and x≈1021.
const STROKES = parseWordmarkRects().filter((r) => r.x < 960);

const VIEW_W = Math.max(...STROKES.map((r) => r.x + r.w));

// Screen-pixel stroke width; non-scaling-stroke keeps it constant while the SVG scales with the page.
const STROKE_PX = 1.5;

// The wordmark has a fixed number of grid columns, so stretching it to the container
// would spread the lines further apart the wider the screen gets. Instead we split each
// column into as many sub-columns as it takes to stay near this pitch, so the field keeps
// a constant density everywhere and glyph strokes become bundles of hairlines.
const TARGET_PITCH_PX = 5;
const MAX_SUBDIVISION = 4;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useSubdivision(ref: React.RefObject<HTMLElement | null>, frozen: boolean) {
  // 1 on the server and until measured, which is what narrow viewports resolve to anyway.
  const [subdivision, setSubdivision] = useState(1);
  // Changing the count remounts the strokes, which would replay the reveal — so stop
  // reacting to resizes once the wordmark has been seen.
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      if (!width || frozenRef.current) return;
      const pitchPx = (WORDMARK_SPACING / VIEW_W) * width;
      const steps = Math.round(pitchPx / TARGET_PITCH_PX);
      setSubdivision(Math.min(Math.max(steps, 1), MAX_SUBDIVISION));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return subdivision;
}

// Center each line in the 1-unit-wide column its rect used to occupy.
const centerOf = (x: number) => x + WORDMARK_STROKE / 2;

const SWEEP = 0.7; // seconds for the build to cross the full width
const delayFor = (x: number) => (x / VIEW_W) * SWEEP;

// The delay comes from the source column, not the drawn x, so the sub-columns of one
// glyph stroke grow together instead of micro-staggering across the bundle.
const strokeVariants: Variants = {
  hidden: ({ y, h }: { y: number; h: number }) => ({ y1: y + h }),
  visible: ({ y, delay }: { y: number; delay: number }) => ({
    y1: y,
    transition: { delay, duration: 0.45, ease: "easeOut" },
  }),
};

export function FlorianLines({ className }: FlorianLinesProps) {
  const reduceMotion = useReducedMotion();
  // Observe a wrapping DOM element rather than the inner <g>: iOS Safari's
  // IntersectionObserver is unreliable on SVG sub-elements and would otherwise
  // leave the wordmark stuck in its collapsed "hidden" state on mobile.
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const subdivision = useSubdivision(ref, inView);

  const { gridXs, strokes } = useMemo(() => {
    const pitch = WORDMARK_SPACING / subdivision;
    const offsets = Array.from({ length: subdivision }, (_, k) => k * pitch);

    return {
      gridXs: Array.from({ length: Math.floor(VIEW_W / pitch) + 1 }, (_, i) => i * pitch),
      strokes: STROKES.flatMap((r) =>
        offsets.map((offset) => ({
          x: r.x + offset,
          y: r.y,
          h: r.h,
          delay: delayFor(r.x),
        })),
      ),
    };
  }, [subdivision]);

  return (
    <div ref={ref} className={className}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${WORDMARK_VIEW_H}`}
        className="block h-auto w-full overflow-visible"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Florian"
      >
        <g className="stroke-[#e5e5e5] dark:stroke-[#262626]" strokeWidth={STROKE_PX} aria-hidden>
          {gridXs.map((x) => (
            <line
              key={x}
              x1={centerOf(x)}
              x2={centerOf(x)}
              y1={0}
              y2={WORDMARK_VIEW_H}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        <motion.g
          className="stroke-[#aeaeae] dark:stroke-[#5c5c5c]"
          strokeWidth={STROKE_PX}
          aria-hidden
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : inView ? "visible" : "hidden"}
        >
          {strokes.map((r, i) => (
            <motion.line
              key={i}
              x1={centerOf(r.x)}
              x2={centerOf(r.x)}
              y2={r.y + r.h}
              vectorEffect="non-scaling-stroke"
              custom={r}
              variants={reduceMotion ? undefined : strokeVariants}
              {...(reduceMotion ? { y1: r.y } : {})}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
