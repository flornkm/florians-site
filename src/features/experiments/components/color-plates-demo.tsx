import type { FC } from "react";

/* A small specimen sheet of hand-picked colours, each labelled with an invented, half-a-word
   name sitting inside its field — the way paint chips get christened. At rest you see the name;
   hovering a swatch swaps the label out for one hand-drawn form that reads the name back to you.
   Static, transparent-backed, no assets — every mark is a tiny inline SVG in currentColor, and
   the reveal is pure Tailwind group-hover, scoped per swatch so only the hovered one flips. */

type Mark = FC<{ className?: string }>;

// Bauhaus marks: geometric primitives only — circles, semicircles, triangles, bars — composed
// two-tone (the plate colour knocks holes for depth), hard mitred corners, square caps. Curved
// primitives are allowed (circles, arcs); no rounded *corners*.
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

// half-asleep — a crescent, carved from one disc by another in the plate colour.
const Moon = svg(
  <>
    <circle cx="12" cy="12" r="8" fill="currentColor" stroke="none" />
    <circle cx="15.2" cy="9.6" r="6.8" fill="var(--plate-bg)" stroke="none" />
  </>,
);

// lagooning — two offset rows of solid semicircular swells.
const Drop = svg(
  <>
    <path d="M3 11A2.7 2.7 0 0 1 8.4 11A2.7 2.7 0 0 1 13.8 11A2.7 2.7 0 0 1 19.2 11Z" fill="currentColor" stroke="none" />
    <path d="M4.8 16A2.7 2.7 0 0 1 10.2 16A2.7 2.7 0 0 1 15.6 16A2.7 2.7 0 0 1 21 16Z" fill="currentColor" stroke="none" />
  </>,
);

// noon-ish — a solid sunburst disc.
const Sun = svg(
  <path
    d="M12 1.5 14.6 5.7 19.4 4.6 18.3 9.4 22.5 12 18.3 14.6 19.4 19.4 14.6 18.3 12 22.5 9.4 18.3 4.6 19.4 5.7 14.6 1.5 12 5.7 9.4 4.6 4.6 9.4 5.7Z"
    fill="currentColor"
    stroke="none"
  />,
);

// far-off — a half-sun over a horizon that recedes in three solid bands.
const Sunset = svg(
  <>
    <path d="M6 15A6 6 0 0 1 18 15Z" fill="currentColor" stroke="none" />
    <rect x="2.2" y="14.3" width="4.3" height="1.4" fill="currentColor" stroke="none" />
    <rect x="17.5" y="14.3" width="4.3" height="1.4" fill="currentColor" stroke="none" />
    <rect x="6" y="17.6" width="12" height="1.4" fill="currentColor" stroke="none" />
    <rect x="8.5" y="20.4" width="7" height="1.4" fill="currentColor" stroke="none" />
  </>,
);

// hush-purple — a diminuendo: four bars stepping down to quiet.
const Star = svg(
  <>
    <rect x="3.5" y="5" width="3" height="13" fill="currentColor" stroke="none" />
    <rect x="8.4" y="8" width="3" height="10" fill="currentColor" stroke="none" />
    <rect x="13.3" y="11" width="3" height="7" fill="currentColor" stroke="none" />
    <rect x="18.2" y="14" width="3" height="4" fill="currentColor" stroke="none" />
  </>,
);

// moss-adjacent — a geometric pine: three tiers on a trunk.
const Leaf = svg(
  <>
    <path d="M12 3 15.6 8.5 8.4 8.5Z" fill="currentColor" stroke="none" />
    <path d="M12 6.5 17 12.5 7 12.5Z" fill="currentColor" stroke="none" />
    <path d="M12 10 18.5 16.5 5.5 16.5Z" fill="currentColor" stroke="none" />
    <rect x="10.7" y="16.5" width="2.6" height="3.2" fill="currentColor" stroke="none" />
  </>,
);

// almost-clay — a thrown vessel: rim, tapered body, footed base.
const Pot = svg(
  <>
    <rect x="5.5" y="6.5" width="13" height="2.2" fill="currentColor" stroke="none" />
    <path d="M7 8.7 17 8.7 15.3 17 8.7 17Z" fill="currentColor" stroke="none" />
    <rect x="9" y="17" width="6" height="1.6" fill="currentColor" stroke="none" />
  </>,
);

// seasick — a boat: trapezoid hull, mainsail and jib rigged to a mast.
const Boat = svg(
  <>
    <path d="M3.5 15 20.5 15 18 19 6 19Z" fill="currentColor" stroke="none" />
    <path d="M12 4 18 14 12 14Z" fill="currentColor" stroke="none" />
    <path d="M11 6 6 14 11 14Z" fill="currentColor" stroke="none" />
    <rect x="11.4" y="3.2" width="1.2" height="10.8" fill="currentColor" stroke="none" />
  </>,
);

// kiln-warm — a flame: pointed triangle over a semicircle, notched at the base to read as fire.
const Flame = svg(
  <>
    <path d="M12 3 17 14A5 5 0 0 1 7 14Z" fill="currentColor" stroke="none" />
    <path d="M12 14.2 14.1 18.7 9.9 18.7Z" fill="var(--plate-bg)" stroke="none" />
  </>,
);

interface Plate {
  color: string;
  name: string;
  Icon: Mark;
}

// Flip the border + label to white once a swatch is dark enough that black would sink into it.
// Perceived brightness (YIQ); < 135 reads as "dark".
const inkFor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 135 ? "#ffffff" : "#000000";
};

const PLATES: Plate[] = [
  { color: "#ff6f59", name: "half-asleep", Icon: Moon },
  { color: "#2ec4b6", name: "lagooning", Icon: Drop },
  { color: "#ffd23f", name: "noon-ish", Icon: Sun },
  { color: "#3d5a80", name: "far-off", Icon: Sunset },
  { color: "#e0aaff", name: "hush-purple", Icon: Star },
  { color: "#84a98c", name: "moss-adjacent", Icon: Leaf },
  { color: "#f28482", name: "almost-clay", Icon: Pot },
  { color: "#1b998b", name: "seasick", Icon: Boat },
  { color: "#e76f51", name: "kiln-warm", Icon: Flame },
];

export const ColorPlates = () => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-6">
    <div className="grid grid-cols-3 gap-2">
      {PLATES.map(({ color, name, Icon }) => {
        const ink = inkFor(color);
        const isLight = ink === "#ffffff";
        return (
          <div
            key={name}
            className="group/plate relative flex size-16 select-none items-end border p-1.5"
            style={
              {
                backgroundColor: color,
                borderColor: ink,
                // A white border alone disappears on a light surface, so wrap it in a black
                // outline (sits just outside the border) to keep the plate edge legible anywhere.
                outline: isLight ? "1px solid #000000" : undefined,
                // Let a mark punch a hole in itself (e.g. the leaf vein) by drawing in the plate colour.
                "--plate-bg": color,
              } as React.CSSProperties
            }
          >
            {/* At rest: the name. Fades out on hover as the mark takes its place. */}
            <span
              className="text-[9px] leading-none tracking-tight opacity-100 group-hover/plate:opacity-0"
              style={{ color: ink }}
            >
              {name}
            </span>
            {/* On hover: the custom form that spells the name out, tinted to the plate's ink. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover/plate:opacity-100"
              style={{ color: ink }}
            >
              <Icon className="size-6" />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
