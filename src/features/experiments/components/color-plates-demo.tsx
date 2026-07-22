import { cn } from "@/lib/utils";
import { type FC, useState } from "react";

/* A small specimen sheet of hand-picked colours, each labelled with an invented, half-a-word
   name sitting inside its field — the way paint chips get christened. At rest you see the name;
   hovering a swatch — or touching it, on hands-on devices — swaps the label out for one
   hand-drawn form that reads the name back to you, plus the chip's printed colour code. A finger
   can slide across the sheet and each plate under it takes its turn, piano-style.
   Every plate stays bright enough for black ink, so the sheet needs no light-on-dark variant.
   Static, transparent-backed, no assets — every mark is a tiny inline SVG in currentColor. */

type Mark = FC<{ className?: string }>;

// Bauhaus marks: geometric primitives only — circles, semicircles, triangles, bars — kept to two
// or three shapes each, hard mitred corners, square caps. Curved primitives are allowed
// (circles, arcs); no rounded *corners*.
const svg = (children: React.ReactNode): Mark =>
  function Icon({ className }) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden
      >
        {children}
      </svg>
    );
  };

// watermelon — a slice: half a disc, the seeds knocked out in the plate colour.
const Watermelon = svg(
  <>
    <path d="M3 15A9 9 0 0 1 21 15Z" fill="currentColor" stroke="none" />
    <circle cx="8.6" cy="12.4" r="1.3" fill="var(--plate-bg)" stroke="none" />
    <circle cx="15.4" cy="12.4" r="1.3" fill="var(--plate-bg)" stroke="none" />
    <circle cx="12" cy="9" r="1.3" fill="var(--plate-bg)" stroke="none" />
  </>,
);

// caramel — a wrapped candy: square centre, a twist triangle each side.
const Caramel = svg(
  <>
    <rect x="8" y="8" width="8" height="8" fill="currentColor" stroke="none" />
    <path d="M8 12 3 8.5 3 15.5Z" fill="currentColor" stroke="none" />
    <path d="M16 12 21 8.5 21 15.5Z" fill="currentColor" stroke="none" />
  </>,
);

// pear-ish — the fruit as two stacked discs.
const Pear = svg(
  <>
    <circle cx="12" cy="7.5" r="4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="15" r="6.5" fill="currentColor" stroke="none" />
  </>,
);

// billiard — a ball: one disc, the number spot knocked out in the plate colour.
const Billiard = svg(
  <>
    <circle cx="12" cy="12" r="8.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="8.5" r="2.6" fill="var(--plate-bg)" stroke="none" />
  </>,
);

// sea-glass — a bottle: neck bar over body bar.
const Bottle = svg(
  <>
    <rect x="10.4" y="3" width="3.2" height="6" fill="currentColor" stroke="none" />
    <rect x="7.5" y="9" width="9" height="12" fill="currentColor" stroke="none" />
  </>,
);

// denim — a jeans pocket: a bar squared off by a triangle point.
const Pocket = svg(
  <>
    <rect x="5" y="5" width="14" height="8" fill="currentColor" stroke="none" />
    <path d="M5 13 19 13 12 20.5Z" fill="currentColor" stroke="none" />
  </>,
);

// grape-soda — three discs clustered like the bunch.
const Grapes = svg(
  <>
    <circle cx="8.3" cy="8.5" r="3.6" fill="currentColor" stroke="none" />
    <circle cx="15.7" cy="8.5" r="3.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="15" r="3.6" fill="currentColor" stroke="none" />
  </>,
);

// lolly — a disc on a stick.
const Lolly = svg(
  <>
    <circle cx="12" cy="9" r="6" fill="currentColor" stroke="none" />
    <rect x="10.9" y="15" width="2.2" height="6" fill="currentColor" stroke="none" />
  </>,
);

// rhubarb — three stalks, cut to different lengths.
const Stalks = svg(
  <>
    <rect x="5.5" y="7" width="2.6" height="13" fill="currentColor" stroke="none" />
    <rect x="10.7" y="4" width="2.6" height="16" fill="currentColor" stroke="none" />
    <rect x="15.9" y="9" width="2.6" height="11" fill="currentColor" stroke="none" />
  </>,
);

interface Plate {
  color: string;
  name: string;
  Icon: Mark;
}

// Every plate is bright by construction (oklch L 0.75–0.81, black ink lands 8.8:1–11.9:1 on all
// of them), so the label, border and marks are always black — no light-on-dark exceptions.
const INK = "#000000";

// Crayon treatment: every hue is the archetype its name evokes, set at a uniform oklch L 0.75 /
// C 0.145 (chroma clamped per-hue to sRGB gamut; pear-ish lifted to L 0.81 — dark chartreuse
// reads olive, not pear). Kept as hex because the value doubles as the code printed on the chip.
const PLATES: Plate[] = [
  { color: "#fc8490", name: "watermelon", Icon: Watermelon },
  { color: "#f69053", name: "caramel", Icon: Caramel },
  { color: "#c7c94c", name: "pear-ish", Icon: Pear },
  { color: "#61c77b", name: "billiard", Icon: Billiard },
  { color: "#1cc8b8", name: "sea-glass", Icon: Bottle },
  { color: "#5db6fd", name: "denim", Icon: Pocket },
  { color: "#ad9efd", name: "grape-soda", Icon: Grapes },
  { color: "#d090ed", name: "lolly", Icon: Lolly },
  { color: "#ea87cb", name: "rhubarb", Icon: Stalks },
];

// The plate under the pointer, resolved by position rather than event target: on touch the
// pointer stays captured by the plate first pressed, so sliding needs a hit-test to let the
// finger play across neighbouring plates.
const plateAtPoint = (e: React.PointerEvent) =>
  document
    .elementFromPoint(e.clientX, e.clientY)
    ?.closest("[data-plate]")
    ?.getAttribute("data-plate") ?? null;

export const ColorPlates = () => {
  // Touch (and held-mouse) reveal; plain mouse hover stays pure CSS.
  const [pressed, setPressed] = useState<string | null>(null);
  const release = () => setPressed(null);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-6">
      <div
        className="grid touch-none grid-cols-3 gap-2"
        onPointerDown={(e) => setPressed(plateAtPoint(e))}
        onPointerMove={(e) => {
          if (e.buttons > 0) setPressed(plateAtPoint(e));
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={release}
      >
        {PLATES.map(({ color, name, Icon }) => (
          <div
            key={name}
            data-plate={name}
            data-pressed={pressed === name || undefined}
            className={cn(
              "group/plate relative flex size-16 select-none items-end border p-1.5",
              "transition-transform duration-150 data-[pressed]:scale-[0.94]",
            )}
            style={
              {
                backgroundColor: color,
                borderColor: INK,
                // Let a mark punch a hole in itself (e.g. the crescent) by drawing in the plate colour.
                "--plate-bg": color,
              } as React.CSSProperties
            }
          >
            {/* Name and code stacked in one grid cell so the code sits exactly where the
                name does; the reveal crossfades between them in place. */}
            <span className="grid" style={{ color: INK }}>
              <span
                className={cn(
                  "self-end text-[9px] leading-none tracking-tight [grid-area:1/1]",
                  "transition-opacity duration-150",
                  "group-hover/plate:opacity-0 group-data-[pressed]/plate:opacity-0",
                )}
              >
                {name}
              </span>
              <span
                aria-hidden
                className={cn(
                  "self-end font-mono text-[9px] leading-none opacity-0 [grid-area:1/1]",
                  "transition-opacity duration-150",
                  "group-hover/plate:opacity-100 group-data-[pressed]/plate:opacity-100",
                )}
              >
                {color}
              </span>
            </span>
            {/* On reveal: the custom form that spells the name out. */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center",
                "opacity-0 transition-opacity duration-150",
                "group-hover/plate:opacity-100 group-data-[pressed]/plate:opacity-100",
              )}
              style={{ color: INK }}
            >
              <Icon className="size-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
