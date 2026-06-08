import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";

// Subtle, slightly-soft spring — a touch of settle, no bounce.
const SPRING = { type: "spring", stiffness: 280, damping: 30, mass: 0.9 } as const;

// Two identical cards on the SAME soft shadow; the only variable is the edge — the
// left draws a separate `border`, the right uses `shadow-ring-lg` (hairline baked into
// the shadow). The toggle springs them from side-by-side into an overlapping stack at
// a lower opacity, so the two edges sit right on top of each other to compare.
export const ShadowRing = () => {
  const [stacked, setStacked] = useState(false);

  const borderPos = stacked ? { x: 0, y: -16, opacity: 0.78 } : { x: -100, y: 0, opacity: 1 };
  const ringPos = stacked ? { x: 0, y: 16, opacity: 0.78 } : { x: 100, y: 0, opacity: 1 };

  return (
    <div className="flex w-full max-w-full flex-col items-center justify-center gap-8 px-6 py-8">
      <div className="grid h-52 w-full max-w-[26rem] place-items-center rounded-3xl bg-surface-secondary">
        <motion.div
          className="col-start-1 row-start-1"
          style={{ zIndex: 1 }}
          initial={false}
          animate={borderPos}
          transition={SPRING}
        >
          <Card ring={false} />
        </motion.div>
        <motion.div
          className="col-start-1 row-start-1"
          style={{ zIndex: 2 }}
          initial={false}
          animate={ringPos}
          transition={SPRING}
        >
          <Card ring />
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => setStacked((s) => !s)}
        whileTap={{ scale: 0.96 }}
        transition={SPRING}
        className={cn(
          "cursor-pointer rounded-full bg-surface px-4 py-2 text-[13px] font-medium text-primary",
          "shadow-ring-xs hairline-black/8 dark:hairline-white/10",
          "transition-colors hover:bg-surface-secondary",
        )}
      >
        {stacked ? "Side by side" : "Overlay"}
      </motion.button>
    </div>
  );
};

function Card({ ring }: { ring: boolean }) {
  return (
    <div
      className={cn(
        "flex w-44 flex-col gap-3.5 rounded-2xl bg-surface p-4",
        ring
          ? "shadow-ring-lg hairline-black/8 dark:hairline-white/10"
          : "border border-primary shadow-lg",
      )}
    >
      {/* full skeleton */}
      <div className="flex items-center gap-2.5">
        <div className="size-8 shrink-0 rounded-full bg-surface-tertiary" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-2 w-full rounded-full bg-surface-tertiary" />
          <div className="h-2 w-3/5 rounded-full bg-surface-tertiary" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-2 w-full rounded-full bg-surface-tertiary" />
        <div className="h-2 w-full rounded-full bg-surface-tertiary" />
        <div className="h-2 w-4/5 rounded-full bg-surface-tertiary" />
      </div>

      {/* the classes themselves, each set apart in its own badge */}
      <div className="flex flex-wrap gap-1">
        {(ring ? ["shadow-ring"] : ["border", "shadow"]).map((cls) => (
          <span
            key={cls}
            className="inline-flex items-center rounded-md bg-quaternary px-2 py-1 font-mono text-[10px] leading-none text-secondary"
          >
            {cls}
          </span>
        ))}
      </div>
    </div>
  );
}
