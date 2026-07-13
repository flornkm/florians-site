import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useRef } from "react";
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

const GRID_XS = Array.from(
  { length: Math.floor(VIEW_W / WORDMARK_SPACING) + 1 },
  (_, i) => i * WORDMARK_SPACING,
);

// Screen-pixel stroke width; non-scaling-stroke keeps it constant while the SVG scales with the page.
const STROKE_PX = 1.5;

// Center each line in the 1-unit-wide column its rect used to occupy.
const centerOf = (x: number) => x + WORDMARK_STROKE / 2;

const SWEEP = 0.7; // seconds for the build to cross the full width
const delayFor = (x: number) => (x / VIEW_W) * SWEEP;

const strokeVariants: Variants = {
  hidden: ({ y, h }: { y: number; h: number }) => ({ y1: y + h }),
  visible: ({ x, y }: { x: number; y: number }) => ({
    y1: y,
    transition: { delay: delayFor(x), duration: 0.45, ease: "easeOut" },
  }),
};

export function FlorianLines({ className }: FlorianLinesProps) {
  const reduceMotion = useReducedMotion();
  // Observe a wrapping DOM element rather than the inner <g>: iOS Safari's
  // IntersectionObserver is unreliable on SVG sub-elements and would otherwise
  // leave the wordmark stuck in its collapsed "hidden" state on mobile.
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

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
          {GRID_XS.map((x) => (
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
          {STROKES.map((r, i) => (
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
