import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const SPRING = { type: "spring", stiffness: 700, damping: 40, mass: 0.6 } as const;

type Variant = "bad" | "good";
const VARIANTS: { id: Variant; label: string }[] = [
  { id: "bad", label: "Bad" },
  { id: "good", label: "Good" },
];

// One nav row, two layouts. The unread count climbs on a loop; "bad" pins Archive
// and Trash at the pixel offsets that fit when the count was 4, so the growing badge
// plows straight over them. "good" is the same row in flow — the labels simply move.
// The badge never behaves differently; the only variable is whether its neighbours
// are allowed to react.
const COUNTS = [
  4, 5, 7, 9, 12, 16, 23, 34, 52, 81, 127, 203, 331, 546, 907, 1517, 2549, 4298, 7266, 12847,
];
const TICK_MS = 110;
const HOLD_START = 10; // ticks resting on 4 before the climb
const HOLD_END = 18; // ticks resting on the overflow before resetting
const PERIOD = HOLD_START + COUNTS.length + HOLD_END;

// pos < 0 is the reduced-motion resting state: the overflow, i.e. the failure.
function countAt(pos: number) {
  if (pos < 0) return COUNTS[COUNTS.length - 1];
  if (pos < HOLD_START) return COUNTS[0];
  return COUNTS[Math.min(pos - HOLD_START, COUNTS.length - 1)];
}

export const AbsolutePosition = () => {
  const reduce = useReducedMotion();
  const [variant, setVariant] = useState<Variant>("bad");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const count = countAt(reduce ? -1 : tick % PERIOD);
  const good = variant === "good";

  return (
    <div className="font-pretendard relative flex h-full w-full items-center justify-center">
      {/* The flow row is shrink-to-fit, so the flex parent keeps it centered at every
          width — it grows symmetrically as the badge widens. The absolute row gets the
          resting width instead: its painted bounds never change (that's its failure),
          and absolute children can't size their parent anyway. */}
      {good ? <FlowNav count={count} /> : <AbsoluteNav count={count} />}

      <div
        role="group"
        aria-label="Layout mode"
        className="absolute bottom-4 left-1/2 grid -translate-x-1/2 grid-cols-2 rounded-full bg-surface-tertiary p-1"
      >
        <motion.span
          layout
          transition={SPRING}
          style={{ gridColumn: variant === "bad" ? 1 : 2, gridRow: 1 }}
          className="pointer-events-none rounded-full bg-surface shadow-ring-sm"
        />
        {VARIANTS.map((v, i) => {
          const active = variant === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(v.id)}
              aria-pressed={active}
              style={{ gridColumn: i + 1, gridRow: 1 }}
              className={cn(
                "relative cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-tertiary hover:text-secondary",
              )}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

function FlowNav({ count }: { count: number }) {
  return (
    <div className="flex h-7 items-center gap-6 text-[17px]">
      <InboxItem count={count} />
      <span className="text-tertiary">Archive</span>
      <span className="text-tertiary">Trash</span>
    </div>
  );
}

// The row as it was measured: Archive at 99, Trash at 181 — true while the badge
// held a single digit, and never again.
function AbsoluteNav({ count }: { count: number }) {
  return (
    <div className="relative h-7 w-[224px] text-[17px]">
      {/* z-10: the badge must paint over the pinned neighbours, not duck under them. */}
      <span className="absolute left-0 top-0 z-10 flex h-7 items-center">
        <InboxItem count={count} />
      </span>
      <span className="absolute left-[99px] top-0 flex h-7 items-center text-tertiary">
        Archive
      </span>
      <span className="absolute left-[181px] top-0 flex h-7 items-center text-tertiary">Trash</span>
    </div>
  );
}

// Ticks land faster than a spin finishes, so NumberFlow keeps interrupting itself —
// that's what makes the climb read as one continuous fast spin instead of steps.
const SPIN = { duration: 450, easing: "cubic-bezier(0.22, 1, 0.36, 1)" } as const;

function InboxItem({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-2 font-medium text-primary">
      Inbox
      <span className="rounded-full bg-surface-tertiary px-2 py-1 text-[13px] font-medium leading-none tabular-nums text-secondary">
        <NumberFlow
          value={count}
          locales="en-US"
          format={{ useGrouping: true }}
          transformTiming={SPIN}
          spinTiming={SPIN}
          willChange
        />
      </span>
    </span>
  );
}
