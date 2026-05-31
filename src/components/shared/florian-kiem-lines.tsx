import { cn } from "@/lib/utils";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useRef } from "react";
import {
  parseWordmarkRects,
  WORDMARK_SPACING,
  WORDMARK_STROKE,
  WORDMARK_VIEW_H,
} from "./florian-kiem-path";

interface FlorianKiemLinesProps {
  className?: string;
}

// Keep only "Florian" — the gap before "Kiem" sits between x≈907 and x≈1021.
const STROKES = parseWordmarkRects().filter((r) => r.x < 960);

const VIEW_W = Math.max(...STROKES.map((r) => r.x + r.w));

const GRID_XS = Array.from(
  { length: Math.floor(VIEW_W / WORDMARK_SPACING) + 1 },
  (_, i) => i * WORDMARK_SPACING,
);

const SWEEP = 0.7; // seconds for the build to cross the full width
const delayFor = (x: number) => (x / VIEW_W) * SWEEP;

const strokeVariants: Variants = {
  hidden: ({ y, h }: { y: number; h: number }) => ({ height: 0, y: y + h }),
  visible: ({ x, y, h }: { x: number; y: number; h: number }) => ({
    height: h,
    y,
    transition: { delay: delayFor(x), duration: 0.45, ease: "easeOut" },
  }),
};

export function FlorianKiemLines({ className }: FlorianKiemLinesProps) {
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
        className="block h-auto w-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Florian"
      >
        <g className="fill-[#e5e5e5] dark:fill-[#262626]" aria-hidden>
          {GRID_XS.map((x) => (
            <rect key={x} x={x} y={0} width={WORDMARK_STROKE} height={WORDMARK_VIEW_H} />
          ))}
        </g>

        <motion.g
          className="fill-[#aeaeae] dark:fill-[#5c5c5c]"
          aria-hidden
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : inView ? "visible" : "hidden"}
        >
          {STROKES.map((r, i) => (
            <motion.rect
              key={i}
              x={r.x}
              width={r.w}
              custom={r}
              variants={reduceMotion ? undefined : strokeVariants}
              {...(reduceMotion ? { y: r.y, height: r.h } : {})}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
