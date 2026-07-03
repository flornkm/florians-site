import { cn } from "@/lib/utils";
import { IconSandbox } from "central-icons/IconSandbox";
import { animate, motion, useMotionTemplate, useMotionValue } from "motion/react";
import { useState } from "react";

// Variable fonts expose a continuous weight axis, so you aren't stuck on the named
// stops. Pretendard's `Regular` sits at 400, but nudging the `wght` axis to 450 gives
// text a touch more presence at reading sizes without tipping into medium. This demo
// animates the axis between the two so the (subtle) difference is easy to feel.
const WEIGHTS = [400, 450] as const;
type Weight = (typeof WEIGHTS)[number];

// Snappy, no overshoot — the switch should feel instant but still glide.
const SPRING = { type: "spring", stiffness: 700, damping: 40, mass: 0.6 } as const;

export const VariableWeight = () => {
  const [weight, setWeight] = useState<Weight>(400);

  // A single animated axis value drives every glyph; the fractional in-between values
  // are exactly what a static font can't render.
  const wght = useMotionValue<number>(400);
  const fontVariationSettings = useMotionTemplate`"wght" ${wght}`;

  const select = (next: Weight) => {
    setWeight(next);
    animate(wght, next, SPRING);
  };

  return (
    <div className="font-pretendard mx-auto flex h-full w-full max-w-sm flex-col justify-center gap-6 px-8 py-8 sm:px-10">
      <motion.div
        style={{ fontVariationSettings }}
        className="flex flex-col gap-2.5 text-pretty text-[0.9375rem] leading-[1.4] text-primary sm:text-base"
      >
        <p>
          Sometimes, text looks too thin, especially when used with bolder icons
          {/* text-primary explicitly: `text-accent-primary` doesn't exist as a text token, so it
              silently generated nothing and the color only worked via inheritance. */}
          <IconSandbox className="ml-1 inline size-[1em] -translate-y-[0.05em] text-primary will-change-transform" />
          .
        </p>
        <p>
          In such cases, using 450 weight in variable fonts is a nice option without making the text
          too bold.
        </p>
      </motion.div>

      <div
        role="group"
        aria-label="Font weight"
        className="relative flex self-start rounded-full bg-surface-tertiary p-1"
      >
        {/* Plain CSS transform, not a Framer `layout` animation — the pill sits outside
            Framer's layout tree, so the tile's open/close morph can't sweep it along.
            Two equal (flex-1) cells, so the pill is half-width and slides by exactly its
            own width. */}
        <span
          aria-hidden
          style={{ transform: weight === 400 ? "translateX(0)" : "translateX(100%)" }}
          className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-surface shadow-ring-sm transition-transform duration-200 ease-out"
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

      <p className="text-xs leading-[1.5] text-tertiary">
        Reach for 450 when text sits next to heavier icons or on dark backgrounds, where 400 starts
        to read a little thin.
      </p>
    </div>
  );
};
