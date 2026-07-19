import { type MotionValue, motion, useReducedMotion, useTime, useTransform } from "motion/react";

/* An homage to the FIFA World Cup 26 identity: concentric "26"s (our Haas Recast, its "6" counter
   filled so the silhouette is solid) in a vivid palette, swelling out of the centre and streaming
   past the frame — an endless zoom down a rainbow tunnel shaped from the tournament number itself.

   Each "26" is born a speck at the centre, holds ONE colour for its whole life as it scales up, then
   fades out the moment it clears the frame (its "unmount") and is reborn at the centre in the next
   colour. Many of them, phase-shifted, nest one inside the last — a smaller solid "26" sits in front
   of a larger one and crops it into a band that follows the numeral's contour — so at any instant
   you see a full spread of colours, each band carrying the colour of the "26" that laid it down.

   The glyph is a hole-free silhouette (extracted from the font, inner counter dropped) so the fills
   tile with no see-through, exactly like the earlier solid tunnel. No effects, no timers, no
   spawner: one clock (`useTime`) drives everything, each glyph reading it at its own phase offset.
   Stacking (smaller in front) is a z-index that tracks scale live. */

// Tryout shape: a solid, hole-free lightning bolt. Any single filled silhouette (no inner counters)
// tiles cleanly the same way the "26" did.
const VIEWBOX = "0 0 100 100";
const D_BOLT = "M58 2L18 56L45 56L40 98L82 40L54 40Z";

const GLYPH = 460; // base px size of an unscaled bolt; transform scale does the zooming

// A solid glyph filling its scaling, centred layer — the tunnel band shape. `fill: currentColor`
// picks up the layer colour.
const Bolt = () => (
  <svg
    aria-hidden
    width={GLYPH}
    height={GLYPH}
    viewBox={VIEWBOX}
    fill="currentColor"
    className="block overflow-visible"
  >
    <path d={D_BOLT} />
  </svg>
);

// Vivid but adjusted to sit beside each other cleanly.
const PALETTE = [
  "#2743d6",
  "#3f86f2",
  "#12b3b0",
  "#18b268",
  "#8ed600",
  "#ffd21e",
  "#ff9017",
  "#ff4d3b",
  "#e21d74",
  "#7b3ff2",
];

const RING_COUNT = 28; // enough nested glyphs that the bands read as a continuous tunnel
const PERIOD = 7000; // ms for one glyph to travel from centre-speck to off-frame
const MIN_SCALE = 0.05;
const MAX_SCALE = 7.5; // > 1 so a glyph fully clears the frame before it loops; bigger = deeper zoom
const FADE_IN = 0.05; // fraction of the life spent fading up from the centre
const FADE_OUT = 0.92; // fraction after which the glyph dissolves as it leaves the frame

const mod = (n: number, m: number) => ((n % m) + m) % m;

// Exponential growth reads as a constant-velocity zoom: equal *ratios* of scale per unit time.
const scaleAt = (life: number) => MIN_SCALE * (MAX_SCALE / MIN_SCALE) ** life;

const opacityAt = (life: number) => {
  if (life < FADE_IN) return life / FADE_IN;
  if (life > FADE_OUT) return Math.max(0, (1 - life) / (1 - FADE_OUT));
  return 1;
};

// Colour is fixed at birth and kept for the whole life. Keying it on the glyph's *birth serial*
// (18·generation − index) — which increments by one for each successive birth — makes neighbouring
// bands, i.e. consecutive births, land on consecutive palette entries, so the tunnel reads as a
// full spectrum instead of one flat colour.
const colorAt = (index: number, generation: number) =>
  PALETTE[mod(RING_COUNT * generation - index, PALETTE.length)];

interface RingProps {
  time: MotionValue<number>;
  index: number;
}

const Ring = ({ time, index }: RingProps) => {
  const phase = index / RING_COUNT;
  // Position in this glyph's own life, in [0, 1). Everything else derives from it.
  const life = useTransform(time, (t) => {
    const raw = t / PERIOD + phase;
    return raw - Math.floor(raw);
  });

  const scale = useTransform(life, scaleAt);
  const opacity = useTransform(life, opacityAt);
  // Smaller (younger) glyphs sit in front, cropping the centre out of the glyph behind them — that
  // overlap is what turns the solid "26"s into concentric bands. z tracks scale live because which
  // glyph is smallest rotates as they cycle. It lives on the scaling box (not the <svg>) so it
  // orders glyphs across layers, not just within one.
  const zIndex = useTransform(life, (l) => Math.round((1 - l) * 1000));
  const color = useTransform(time, (t) => colorAt(index, Math.floor(t / PERIOD + phase)));

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 flex items-center justify-center will-change-transform"
      style={{ scale, opacity, zIndex, color, transformOrigin: "center" }}
    >
      <Bolt />
    </motion.div>
  );
};

// Reduced-motion: freeze the tunnel into a static nest of concentric "26"s.
const StaticTunnel = () => (
  <>
    {Array.from({ length: RING_COUNT }, (_, index) => {
      const life = index / RING_COUNT;
      return (
        <div
          key={index}
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${scaleAt(life)})`,
            zIndex: Math.round((1 - life) * 1000),
            color: colorAt(index, 0),
          }}
        >
          <Bolt />
        </div>
      );
    })}
  </>
);

export const WorldCupTunnel = () => {
  const reduced = useReducedMotion();
  const time = useTime();

  return (
    <div className="flex h-full w-full items-center justify-center p-8 sm:p-12">
      {/* The tunnel lives in a small rounded card centred in the dialog, not full-bleed. */}
      <div className="relative aspect-[4/3] w-[min(60%,20rem)] overflow-hidden">
        {reduced ? (
          <StaticTunnel />
        ) : (
          Array.from({ length: RING_COUNT }, (_, index) => (
            <Ring key={index} time={time} index={index} />
          ))
        )}

        {/* A static solid white bolt pinned in front of the whole tunnel — the mark the coloured
            bands zoom out of. z sits above the rings' live z (which tops out at 1000). */}
        <div className="pointer-events-none absolute inset-0 z-[2000] flex items-center justify-center text-white">
          <svg aria-hidden viewBox={VIEWBOX} fill="currentColor" className="w-[20%]">
            <path d={D_BOLT} />
          </svg>
        </div>

        {/* Inset hairline on top of everything — an element's own inset box-shadow paints under its
            children, so the ring has to be its own top-most layer to sit above the bands. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3000] ring-1 ring-inset ring-black/10 dark:ring-white/10"
        />
      </div>
    </div>
  );
};
