import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

/* Stacked avatars without borders: each avatar is an SVG whose mask cuts out a
   crescent where the previous avatar overlaps, so the separation is a real hole
   and any background shows through it. The inset ring follows the clipped
   outline exactly — its two arcs are the avatar circle inset by the ring
   offset and the neighbour's cut circle grown by it, which meet at the same
   points the clip does. The gradient drifting behind the stack (and through
   the crescent holes) is what proves the gaps are real. */

const SIZE = 44;
/** Fraction of the diameter each avatar sinks into the one before it. */
const OVERLAP = 0.25;
/** Visible crescent between neighbours, px. */
const GAP = 2.5;
const RING_WIDTH = 1;
/** Centers the stroke so its outer edge sits exactly on the clipped outline. */
const RING_INSET = RING_WIDTH / 2;

const RADIUS = SIZE / 2;
const NEIGHBOUR_CX = RADIUS - SIZE * (1 - OVERLAP);
const CUT_RADIUS = RADIUS + GAP;

// The crescent eats the left of a clipped avatar, so its visible region's
// optical center sits right of the geometric one. Halfway toward the visible
// band's midpoint reads centered; the full midpoint overshoots.
const CLIPPED_TEXT_SHIFT = (NEIGHBOUR_CX + CUT_RADIUS) / 4;

// Equal perceived brightness: every background sits at the same OKLCH lightness,
// with chroma at ~70% of each hue's sRGB maximum (equal absolute chroma would
// leave green washed out — its gamut ceiling at this lightness is half indigo's).
// Text tints share one lightness and one low chroma across all hues.
const PEOPLE = [
  {
    initials: "AF",
    fill: "fill-[oklch(0.55_0.176_275)]",
    text: "fill-[oklch(0.9_0.045_275)]",
  },
  {
    initials: "NH",
    fill: "fill-[oklch(0.55_0.154_15)]",
    text: "fill-[oklch(0.9_0.045_15)]",
  },
  {
    initials: "TO",
    fill: "fill-[oklch(0.55_0.095_155)]",
    text: "fill-[oklch(0.9_0.045_155)]",
  },
];

function StackAvatar({ initials, fill, textFill, isFirst }: {
  initials: string;
  fill: string;
  textFill: string;
  isFirst: boolean;
}) {
  // Per-instance ids: the demo can be mounted twice at once (dialog + drawer),
  // and colliding mask ids would clip every stack against the first one's defs.
  const id = useId();
  const bodyMask = isFirst ? undefined : `url(#${id}-body)`;
  const ringMask = isFirst ? undefined : `url(#${id}-ring)`;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden
      className="select-none"
      style={{ marginLeft: isFirst ? 0 : -SIZE * OVERLAP }}
    >
      {!isFirst && (
        <defs>
          <mask id={`${id}-body`}>
            <rect width="100%" height="100%" fill="black" />
            <circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill="white" />
            <circle cx={NEIGHBOUR_CX} cy={RADIUS} r={CUT_RADIUS} fill="black" />
          </mask>
          <mask id={`${id}-ring`}>
            <rect width="100%" height="100%" fill="white" />
            <circle cx={NEIGHBOUR_CX} cy={RADIUS} r={CUT_RADIUS + RING_INSET} fill="black" />
          </mask>
          <clipPath id={`${id}-clip`}>
            <circle cx={RADIUS} cy={RADIUS} r={RADIUS - RING_INSET} />
          </clipPath>
        </defs>
      )}

      <g mask={bodyMask}>
        <circle cx={RADIUS} cy={RADIUS} r={RADIUS} className={fill} />
        <text
          x={isFirst ? RADIUS : RADIUS + CLIPPED_TEXT_SHIFT}
          y={RADIUS}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={SIZE * 0.3}
          className={cn("font-serif italic", textFill)}
        >
          {initials}
        </text>
      </g>

      {/* The ring's two arcs: the avatar circle inset by half the stroke (masked
          off where the neighbour's grown circle covers it), and the neighbour's
          grown circle (clipped to the inset avatar circle). Both hug the clipped
          outline flush and meet exactly where the clip's arcs do. */}
      <g fill="none" strokeWidth={RING_WIDTH} className="stroke-black/20 dark:stroke-white/35">
        <circle cx={RADIUS} cy={RADIUS} r={RADIUS - RING_INSET} mask={ringMask} />
        {!isFirst && (
          <circle
            cx={NEIGHBOUR_CX}
            cy={RADIUS}
            r={CUT_RADIUS + RING_INSET}
            clipPath={`url(#${id}-clip)`}
          />
        )}
      </g>
    </svg>
  );
}

export function AvatarStack() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Drifts up and down behind the stack — the avatars are z-10, the
          gradient isn't, so it passes behind them and shows through the
          crescent gaps. Static (and centered behind the stack) under reduced
          motion, which still demonstrates the layering. */}
      <motion.div
        aria-hidden
        // The inset hairline mirrors the avatars' ring: 1px crisp, dark in
        // light mode, light in dark mode.
        className="absolute h-24 w-40 rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.2)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35)]"
        style={{
          // Interpolating in oklch keeps the hue walk vivid; sRGB interpolation
          // would gray out the midpoints.
          background:
            "linear-gradient(to bottom in oklch, oklch(0.87 0.07 85), oklch(0.76 0.11 30) 45%, oklch(0.58 0.13 300))",
        }}
        animate={reduceMotion ? { y: 0 } : { y: [90, -90] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
        }
      />
      <div className="relative z-10 flex items-center">
        {PEOPLE.map((person, index) => (
          <StackAvatar
            key={person.initials}
            initials={person.initials}
            fill={person.fill}
            textFill={person.text}
            isFirst={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
