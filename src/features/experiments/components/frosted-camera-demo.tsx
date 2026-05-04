import { animate, AnimatePresence, motion, useMotionValue } from "motion/react";
import { useState } from "react";

type VariantId = "light" | "grey" | "dark";

const VARIANTS: {
  id: VariantId;
  name: string;
  src: string;
}[] = [
  { id: "light", name: "Frost", src: "/images/experiments/frosted-camera-light.webp" },
  { id: "grey", name: "Mist", src: "/images/experiments/frosted-camera-grey.webp" },
  { id: "dark", name: "Onyx", src: "/images/experiments/frosted-camera-dark.webp" },
];

const EASE = [0.32, 0.72, 0, 1] as const;
const IMAGE_TWEEN = { duration: 0.55, ease: EASE };
const SNAP_SPRING = { type: "spring" as const, stiffness: 420, damping: 36, mass: 0.6 };
const WIDEST_NAME = VARIANTS.reduce((a, b) => (a.name.length >= b.name.length ? a : b)).name;

const TRACK_WIDTH = 240;
const STOPS = VARIANTS.map((_, i) => (i / (VARIANTS.length - 1)) * TRACK_WIDTH);
const DEFAULT_INDEX = 1;

export const FrostedCamera = () => {
  const [selected, setSelected] = useState<VariantId>(VARIANTS[DEFAULT_INDEX].id);
  const variant = VARIANTS.find((v) => v.id === selected) ?? VARIANTS[DEFAULT_INDEX];
  const x = useMotionValue(STOPS[DEFAULT_INDEX]);

  const snap = () => {
    const cur = x.get();
    let idx = 0;
    let min = Infinity;
    for (let i = 0; i < STOPS.length; i++) {
      const d = Math.abs(cur - STOPS[i]);
      if (d < min) {
        min = d;
        idx = i;
      }
    }
    animate(x, STOPS[idx], SNAP_SPRING);
    if (VARIANTS[idx].id !== selected) setSelected(VARIANTS[idx].id);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between gap-6 px-6 pt-6 pb-8 bg-primary">
      <div className="relative flex flex-1 w-full items-center justify-center overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.img
            key={variant.id}
            src={variant.src}
            alt={`${variant.name} camera`}
            draggable={false}
            initial={{ opacity: 0, scale: 0.92, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.92, filter: "blur(4px)" }}
            transition={IMAGE_TWEEN}
            className="absolute inset-0 m-auto max-h-full w-auto max-w-[78%] object-contain pointer-events-none select-none will-change-[transform,opacity,filter]"
          />
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-baseline gap-1.5 text-xs">
          <span className="text-quaternary">Color</span>
          <span className="relative inline-block">
            <span aria-hidden className="invisible font-medium">
              {WIDEST_NAME}
            </span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={variant.id}
                initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute inset-0 font-medium text-primary"
              >
                {variant.name}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <div className="relative" style={{ width: TRACK_WIDTH }}>
          <div
            className="h-1.5 w-full rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/15"
            style={{
              background: "linear-gradient(to right, #ffffff 0%, #d4d4d4 50%, #1f1f1f 100%)",
            }}
          />
          {STOPS.map((stop, i) => (
            <button
              key={VARIANTS[i].id}
              type="button"
              aria-label={VARIANTS[i].name}
              onClick={() => {
                animate(x, stop, SNAP_SPRING);
                if (VARIANTS[i].id !== selected) setSelected(VARIANTS[i].id);
              }}
              className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ left: stop }}
            />
          ))}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: TRACK_WIDTH }}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={snap}
            whileDrag={{ scale: 1.1 }}
            whileTap={{ scale: 1.05 }}
            style={{ x, translateY: "-50%", translateX: "-50%" }}
            transition={SNAP_SPRING}
            className="absolute top-1/2 left-0 size-5 cursor-grab touch-none rounded-full bg-white ring-1 ring-black/15 shadow-[0_2px_6px_rgba(0,0,0,0.18)] active:cursor-grabbing will-change-transform"
          />
        </div>
      </div>
    </div>
  );
};
