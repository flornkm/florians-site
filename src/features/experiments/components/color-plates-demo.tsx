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

// sunburnt — a beach parasol: half a disc on a stem.
const Parasol = svg(
  <>
    <path d="M4 12A8 8 0 0 1 20 12Z" fill="currentColor" stroke="none" />
    <rect x="10.9" y="12" width="2.2" height="7.5" fill="currentColor" stroke="none" />
  </>,
);

// poolside — three still bands of water.
const Water = svg(
  <>
    <rect x="3" y="7" width="18" height="2.4" fill="currentColor" stroke="none" />
    <rect x="3" y="12" width="18" height="2.4" fill="currentColor" stroke="none" />
    <rect x="3" y="17" width="18" height="2.4" fill="currentColor" stroke="none" />
  </>,
);

// high-noon — a disc with four cardinal rays.
const Sun = svg(
  <>
    <circle cx="12" cy="12" r="5.5" fill="currentColor" stroke="none" />
    <rect x="10.8" y="1.5" width="2.4" height="3.5" fill="currentColor" stroke="none" />
    <rect x="10.8" y="19" width="2.4" height="3.5" fill="currentColor" stroke="none" />
    <rect x="1.5" y="10.8" width="3.5" height="2.4" fill="currentColor" stroke="none" />
    <rect x="19" y="10.8" width="3.5" height="2.4" fill="currentColor" stroke="none" />
  </>,
);

// wide-sky — a half disc resting on a long horizon.
const Horizon = svg(
  <>
    <path d="M5 14A7 7 0 0 1 19 14Z" fill="currentColor" stroke="none" />
    <rect x="2" y="16" width="20" height="2.4" fill="currentColor" stroke="none" />
  </>,
);

// soft-plum — the fruit: one disc under a short stem.
const Plum = svg(
  <>
    <circle cx="12" cy="14" r="7" fill="currentColor" stroke="none" />
    <rect x="10.9" y="3.5" width="2.2" height="4.5" fill="currentColor" stroke="none" />
  </>,
);

// spring-ish — a geometric pine: one tier on a trunk.
const Pine = svg(
  <>
    <path d="M12 4 19 16 5 16Z" fill="currentColor" stroke="none" />
    <rect x="10.7" y="16" width="2.6" height="4" fill="currentColor" stroke="none" />
  </>,
);

// bubblegum — a ring: one disc knocked out by another in the plate colour.
const Ring = svg(
  <>
    <circle cx="12" cy="12" r="8.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="3.5" fill="var(--plate-bg)" stroke="none" />
  </>,
);

// apricot-ish — the fruit again, told apart from the plum by a triangle leaf.
const Apricot = svg(
  <>
    <circle cx="12" cy="14" r="7" fill="currentColor" stroke="none" />
    <path d="M12 8.5 18 3 19 9Z" fill="currentColor" stroke="none" />
  </>,
);

// minty — a leaf: two arcs, the vein knocked out in the plate colour.
const Leaf = svg(
  <>
    <path d="M12 3A11.5 11.5 0 0 1 12 21A11.5 11.5 0 0 1 12 3Z" fill="currentColor" stroke="none" />
    <rect x="11.2" y="6.5" width="1.6" height="11" fill="var(--plate-bg)" stroke="none" />
  </>,
);

interface Plate {
  color: string;
  name: string;
  Icon: Mark;
}

// Every plate is bright by construction (oklch L 0.75–0.83, black ink lands 8.8:1–12.4:1 on all
// of them), so the label, border and marks are always black — no light-on-dark exceptions.
const INK = "#000000";

// Crayon treatment: every hue is the archetype its name evokes, set at a uniform oklch L 0.75 /
// C 0.145 (chroma clamped per-hue to sRGB gamut; high-noon lifted to L 0.83 — dark yellow reads
// mustard, not noon sun). Kept as hex because the value doubles as the code printed on the chip.
const PLATES: Plate[] = [
  { color: "#fc8876", name: "sunburnt", Icon: Parasol },
  { color: "#1cc4d3", name: "poolside", Icon: Water },
  { color: "#ecc246", name: "high-noon", Icon: Sun },
  { color: "#4bb8fd", name: "wide-sky", Icon: Horizon },
  { color: "#d68ee7", name: "soft-plum", Icon: Plum },
  { color: "#8bc15b", name: "spring-ish", Icon: Pine },
  { color: "#f584b1", name: "bubblegum", Icon: Ring },
  { color: "#e89c33", name: "apricot-ish", Icon: Apricot },
  { color: "#25cb9c", name: "minty", Icon: Leaf },
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
