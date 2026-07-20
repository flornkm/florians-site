import type { FC } from "react";

/* A small specimen sheet of hand-picked colours, each labelled with an invented, half-a-word
   name sitting inside its field — the way paint chips get christened. At rest you see the name;
   hovering a swatch swaps the label out for one hand-drawn form that reads the name back to you.
   Every plate stays bright enough for black ink, so the sheet needs no light-on-dark variant.
   Static, transparent-backed, no assets — every mark is a tiny inline SVG in currentColor, and
   the reveal is pure Tailwind group-hover, scoped per swatch so only the hovered one flips. */

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

// sunburnt — a crescent, carved from one disc by another in the plate colour.
const Moon = svg(
  <>
    <circle cx="12" cy="12" r="8" fill="currentColor" stroke="none" />
    <circle cx="15.2" cy="9.6" r="6.8" fill="var(--plate-bg)" stroke="none" />
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

// soft-plum — a single solid triangle.
const Peak = svg(<path d="M12 4 21 19 3 19Z" fill="currentColor" stroke="none" />);

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

// apricot-ish — a diamond, the square stood on its corner.
const Diamond = svg(<path d="M12 3 21 12 12 21 3 12Z" fill="currentColor" stroke="none" />);

// minty — a quarter disc, one corner of a square swept round.
const Quarter = svg(<path d="M4 4 20 4A16 16 0 0 1 4 20Z" fill="currentColor" stroke="none" />);

interface Plate {
  color: string;
  name: string;
  Icon: Mark;
}

// Every plate is bright by construction (YIQ well above the ~135 point where black ink starts to
// sink), so the label, border and marks are always black — no light-on-dark exceptions.
const INK = "#000000";

const PLATES: Plate[] = [
  { color: "#ff7a5c", name: "sunburnt", Icon: Moon },
  { color: "#4fd8c4", name: "poolside", Icon: Water },
  { color: "#ffd23f", name: "high-noon", Icon: Sun },
  { color: "#7cc4ff", name: "wide-sky", Icon: Horizon },
  { color: "#d9a6ff", name: "soft-plum", Icon: Peak },
  { color: "#9bd977", name: "spring-ish", Icon: Pine },
  { color: "#ffa8c5", name: "bubblegum", Icon: Ring },
  { color: "#ffb347", name: "apricot-ish", Icon: Diamond },
  { color: "#7ff0d0", name: "minty", Icon: Quarter },
];

export const ColorPlates = () => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-6">
    <div className="grid grid-cols-3 gap-2">
      {PLATES.map(({ color, name, Icon }) => (
        <div
          key={name}
          className="group/plate relative flex size-16 select-none items-end border p-1.5"
          style={
            {
              backgroundColor: color,
              borderColor: INK,
              // Let a mark punch a hole in itself (e.g. the crescent) by drawing in the plate colour.
              "--plate-bg": color,
            } as React.CSSProperties
          }
        >
          {/* At rest: the name. Fades out on hover as the mark takes its place. */}
          <span
            className="text-[9px] leading-none tracking-tight opacity-100 group-hover/plate:opacity-0"
            style={{ color: INK }}
          >
            {name}
          </span>
          {/* On hover: the custom form that spells the name out. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover/plate:opacity-100"
            style={{ color: INK }}
          >
            <Icon className="size-6" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
