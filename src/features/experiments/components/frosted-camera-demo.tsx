import { AnimatePresence, motion } from "motion/react";
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

const DEFAULT_INDEX = 1;

export const FrostedCamera = () => {
  const [index, setIndex] = useState(DEFAULT_INDEX);
  const variant = VARIANTS[index];

  // The camera itself is the only control: each tap cycles the "color" variable to the
  // next stop, wrapping at the end, driving the image crossfade and the label.
  const cycle = () => setIndex((i) => (i + 1) % VARIANTS.length);

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <motion.button
        type="button"
        onClick={cycle}
        aria-label={`Camera color: ${variant.name}. Tap to change.`}
        whileTap={{ scale: 0.97 }}
        transition={SNAP_SPRING}
        className="relative flex h-full w-full items-center justify-center overflow-hidden cursor-pointer outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* Warm every variant into the browser cache as soon as the demo mounts (which only
            happens once the tile is opened), so cycling to a not-yet-shown color never flashes
            a network fetch. Off-screen and hidden, purely to trigger the fetch. */}
        <div aria-hidden className="pointer-events-none absolute size-0 overflow-hidden opacity-0">
          {VARIANTS.map((v) => (
            <img key={v.id} src={v.src} alt="" decoding="async" />
          ))}
        </div>

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
            className="absolute inset-0 m-auto max-h-full w-auto max-w-[60%] object-contain pointer-events-none select-none will-change-[transform,opacity,filter]"
          />
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
