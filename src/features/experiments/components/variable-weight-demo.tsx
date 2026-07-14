import { cn } from "@/lib/utils";
import { IconPencilLine } from "central-icons/IconPencilLine";
import { IconShareOs } from "central-icons/IconShareOs";
import { IconTrashCan } from "central-icons/IconTrashCan";
import { animate, motion, useMotionTemplate, useMotionValue } from "motion/react";
import { Fragment, useState } from "react";

// Variable fonts expose a continuous weight axis, so you aren't stuck on the named
// stops. Pretendard's Regular (400) reads a touch thin next to bolder UI icons;
// nudging the `wght` axis to 450 restores the balance without jumping to Medium.
// 500 is included so the sweet spot is visible from both sides. The demo animates
// the axis, so the fractional in-between values — exactly what a static font can't
// render — are easy to feel.
const WEIGHTS = [400, 450, 500] as const;
type Weight = (typeof WEIGHTS)[number];

// Snappy, no overshoot — the switch should feel instant but still glide.
const SPRING = { type: "spring", stiffness: 700, damping: 40, mass: 0.6 } as const;

const PILL_X: Record<Weight, string> = { 400: "0%", 450: "100%", 500: "200%" };

const ITEMS = [
  { Icon: IconShareOs, label: "Share" },
  { Icon: IconPencilLine, label: "Rename" },
  { Icon: IconTrashCan, label: "Delete" },
];

export const VariableWeight = () => {
  const [weight, setWeight] = useState<Weight>(400);

  // A single animated axis value drives every label; the icons keep their fixed
  // stroke weight, so only the text moves against them.
  const wght = useMotionValue<number>(400);
  const fontVariationSettings = useMotionTemplate`"wght" ${wght}`;

  const select = (next: Weight) => {
    setWeight(next);
    animate(wght, next, SPRING);
  };

  return (
    <div className="font-pretendard relative flex h-full w-full flex-col items-center justify-center px-8 py-8">
      <motion.ul
        style={{ fontVariationSettings }}
        className="flex w-52 flex-col rounded-xl bg-surface p-1 shadow-ring-sm"
      >
        {ITEMS.map(({ Icon, label }, index) => (
          <Fragment key={label}>
            {/* Inset like iOS list separators: the left edge lines up with the labels
                (row padding + icon + gap), so the hairline never runs under the icons. */}
            {index > 0 && <li aria-hidden className="ml-9 mr-2.5 border-t border-primary" />}
            <li className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-primary">
              <Icon className="size-4 shrink-0" />
              {label}
            </li>
          </Fragment>
        ))}
      </motion.ul>

      <div
        role="group"
        aria-label="Font weight"
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 rounded-full bg-surface-tertiary p-1"
      >
        {/* Plain CSS transform, not a Framer `layout` animation — the pill sits outside
            Framer's layout tree, so the tile's open/close morph can't sweep it along.
            Three equal (flex-1) cells, so the pill is a third wide and slides by exact
            multiples of its own width. */}
        <span
          aria-hidden
          style={{ transform: `translateX(${PILL_X[weight]})` }}
          className="pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-surface shadow-ring-sm transition-transform duration-200 ease-out"
        />
        {WEIGHTS.map((w) => {
          const active = weight === w;
          return (
            <button
              key={w}
              type="button"
              onClick={() => select(w)}
              aria-pressed={active}
              className={cn(
                "relative flex-1 cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-tertiary hover:text-secondary",
              )}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
};
