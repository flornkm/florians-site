import { cn } from "@/lib/utils";
import { motion, useReducedMotion, type Variants } from "motion/react";
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

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${WORDMARK_VIEW_H}`}
      className={cn("block h-auto w-full", className)}
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
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
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
  );
}
