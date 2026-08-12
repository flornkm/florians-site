import { motion } from "motion/react";
import { useMemo, useState } from "react";

/* Bold rounded letters piled onto each other like cut paper: each glyph is randomly rotated and
   nudged, overlaps its neighbour, and — because every letter carries a thick background-coloured
   stroke painted *behind* its fill (paint-order: stroke) — the one in front knocks a clean gap out
   of the one behind. So the pile reads as stacked shapes clipping each other, not a smudged blob.
   Pure black & white, themed by prefers-color-scheme; the stroke colour is kept identical to the
   surface so the knockout gaps *are* the background showing through. Click to reshuffle the pile
   and cycle the word. No assets, no canvas. */

const WORDS = ["STACK", "OVERLAP", "LAYERS", "SHAPES", "BOLD", "PAIR UP"];

const MAX_ROT = 15; // deg of random tilt per letter
const OVERLAP = 0.22; // how far each letter bites into the previous, in em

// A right-pointing "next" arrow shown while hovering — clicking advances to the next word. White
// fill + black outline so it stays legible over either theme (like an OS cursor). encodeURIComponent
// keeps it SSR-safe (no btoa). Hotspot centred on the arrow.
const ARROW =
  "<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'>" +
  "<path d='M4 12 H17 V6 L27 15 L17 24 V18 H4 Z' fill='white' stroke='black' stroke-width='1.6' stroke-linejoin='round'/>" +
  "</svg>";
const NEXT_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(ARROW)}") 15 15, pointer`;

// Deterministic 0..1 hash so the layout is stable per (seed, letter) and reproducible in SSR /
// poster capture without touching Math.random (which the lint forbids and which would reshuffle
// every render).
const hash = (n: number) => {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
};

interface Glyph {
  ch: string;
  rot: number;
  dy: number; // vertical nudge, em
  space: boolean;
}

function layout(word: string, seed: number): Glyph[] {
  return [...word].map((ch, i) => {
    const space = ch === " ";
    return {
      ch,
      space,
      rot: space ? 0 : (hash(seed * 97 + i * 13 + 1) - 0.5) * 2 * MAX_ROT,
      dy: space ? 0 : (hash(seed * 131 + i * 29 + 7) - 0.5) * 0.16,
    };
  });
}

export const OverlapType = () => {
  const [seed, setSeed] = useState(1);
  const [wordIdx, setWordIdx] = useState(0);

  const word = WORDS[wordIdx];
  const glyphs = useMemo(() => layout(word, seed), [word, seed]);

  // Letters minus spaces set the on-screen width, so the type scales to fill the box no matter the
  // word length. cqw needs the container to declare containerType (below).
  const letters = word.replace(/\s/g, "").length;
  const fontSize = `min(${Math.round(60 / letters)}cqw, 13cqh, 4.5rem)`;

  const reshuffle = () => {
    setSeed((s) => s + 1);
    setWordIdx((i) => (i + 1) % WORDS.length);
  };

  return (
    <div className="absolute inset-0">
      <button
        type="button"
        onClick={reshuffle}
        aria-label={`Overlapping bold letters spelling ${word}. Click to reshuffle.`}
        className="group absolute inset-0 flex items-center justify-center overflow-hidden px-8 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-400"
        style={{ containerType: "size", cursor: NEXT_CURSOR }}
      >
        {/* key on word+seed replays the drop-in stagger on every reshuffle. */}
        <motion.div
          key={`${word}-${seed}`}
          aria-hidden
          className="flex select-none items-center text-neutral-900 dark:text-neutral-100"
          style={{
            fontFamily: '"Haas Recast", sans-serif',
            fontSize,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
          initial="hidden"
          animate="shown"
          transition={{ staggerChildren: 0.045 }}
        >
          {glyphs.map((g, i) =>
            g.space ? (
              <span key={i} aria-hidden style={{ width: "0.28em" }} />
            ) : (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: "-0.35em", scale: 0.8, filter: "blur(2px)" },
                  shown: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
                }}
                transition={{
                  type: "spring",
                  stiffness: 480,
                  damping: 26,
                  // Tween the blur — a spring would undershoot into an invalid negative radius.
                  filter: { type: "tween", duration: 0.24, ease: "easeOut" },
                }}
                style={{
                  // Individual `rotate`/`translate` CSS props (not `transform`) so they compose with
                  // motion's y/scale animation instead of overwriting it.
                  rotate: `${g.rot}deg`,
                  translate: `0 ${g.dy}em`,
                  marginLeft: i === 0 ? 0 : `-${OVERLAP}em`,
                  // The knockout: a fat stroke the exact colour of the surface, painted behind the
                  // fill. The front letter's stroke eats into the one behind → the clipping gap.
                  paintOrder: "stroke",
                  WebkitTextStrokeWidth: "0.055em",
                  WebkitTextStrokeColor: "var(--overlap-knock)",
                }}
                className="[--overlap-knock:#ffffff] dark:[--overlap-knock:#0a0a0a]"
              >
                {g.ch}
              </motion.span>
            ),
          )}
        </motion.div>
      </button>
    </div>
  );
};
