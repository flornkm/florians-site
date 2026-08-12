import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "../../../hooks/use-media-query";

// A navigable knowledge graph, like the reference page. One node sits at the centre with its
// connections fanned out around it; click any of them and the graph re-centres on that node,
// its own neighbours springing out from the middle while the rest collapse back in. The whole
// thing floats gently the whole time. Pure SVG, no assets. Click the centre to step back.

// One consistent family of clean filled silhouettes — no numbers or inner marks, so every icon
// reads at the same level of detail; colour and shape alone tell them apart.
type Glyph =
  | "logo"
  | "circle"
  | "square"
  | "diamond"
  | "triangle"
  | "pentagon"
  | "hexagon"
  | "flower";

interface GNode {
  id: string;
  label: string;
  glyph: Glyph;
  // Topic nodes you can travel into carry an accent hue; the home node (Florian's mark) stays
  // neutral. `default` marks the thread lit at rest.
  color?: string;
  default?: boolean;
}

const NODES: GNode[] = [
  { id: "florian", label: "Florian", glyph: "logo" },
  { id: "interfaces", label: "Interfaces", glyph: "hexagon", color: "var(--accent-blue)" },
  { id: "motion", label: "Motion", glyph: "circle", color: "var(--accent-orange)" },
  { id: "shaders", label: "Shaders", glyph: "triangle", color: "var(--accent-rose)" },
  { id: "webgl", label: "WebGL", glyph: "square", color: "var(--accent-sage)" },
  { id: "three-d", label: "3D", glyph: "pentagon", color: "var(--accent-gold)" },
  { id: "play", label: "Play", glyph: "hexagon", color: "var(--accent-yellow)" },
  { id: "make", label: "Make", glyph: "flower", color: "var(--accent-clay)", default: true },
  { id: "craft", label: "Craft", glyph: "diamond", color: "var(--accent-olive)" },
  { id: "typography", label: "Typography", glyph: "circle", color: "var(--accent-gold)" },
  { id: "systems", label: "Systems", glyph: "pentagon", color: "var(--accent-blue)" },
  { id: "tools", label: "Tools", glyph: "square", color: "var(--accent-sage)" },
  { id: "web", label: "Web", glyph: "hexagon", color: "var(--accent-clay)" },
  { id: "curiosity", label: "Curiosity", glyph: "circle", color: "var(--accent-rose)" },
  { id: "signals", label: "Signals", glyph: "triangle", color: "var(--accent-yellow)" },
  { id: "friction", label: "Friction", glyph: "diamond", color: "var(--accent-orange)" },
];

const NODE_BY_ID = new Map(NODES.map((n) => [n.id, n]));

// Undirected edge list. Dash style alternates so the resting web reads like the reference.
const EDGES: [string, string][] = [
  ["florian", "interfaces"],
  ["florian", "motion"],
  ["florian", "systems"],
  ["florian", "craft"],
  ["florian", "curiosity"],
  ["florian", "make"],
  ["interfaces", "motion"],
  ["interfaces", "typography"],
  ["interfaces", "webgl"],
  ["motion", "play"],
  ["motion", "shaders"],
  ["shaders", "play"],
  ["shaders", "webgl"],
  ["webgl", "three-d"],
  ["three-d", "play"],
  ["play", "make"],
  ["make", "craft"],
  ["make", "friction"],
  ["craft", "typography"],
  ["typography", "systems"],
  ["systems", "tools"],
  ["tools", "web"],
  ["web", "curiosity"],
  ["curiosity", "signals"],
  ["signals", "friction"],
];

// Adjacency in edge order, so a node's neighbours fan out in a stable arrangement.
const ADJ = new Map<string, string[]>(NODES.map((n) => [n.id, []]));
for (const [a, b] of EDGES) {
  ADJ.get(a)?.push(b);
  ADJ.get(b)?.push(a);
}

const edgeDash = (a: string, b: string): "dot" | "dash" => {
  const i = EDGES.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return i % 2 === 0 ? "dot" : "dash";
};

const CENTER = { x: 410, y: 322 };
const RING = 200;
const GAP = 22;

interface Pt {
  x: number;
  y: number;
}
interface Placed extends Pt {
  visible: boolean;
}

// Where every node wants to be for a given centre: the centre in the middle, its neighbours on
// a ring, everything else collapsed to the middle (and hidden).
function layoutFor(centerId: string): Map<string, Placed> {
  const map = new Map<string, Placed>();
  for (const n of NODES) map.set(n.id, { x: CENTER.x, y: CENTER.y, visible: false });
  map.set(centerId, { x: CENTER.x, y: CENTER.y, visible: true });
  const nbrs = ADJ.get(centerId) ?? [];
  nbrs.forEach((id, k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / nbrs.length;
    map.set(id, {
      x: CENTER.x + Math.cos(a) * RING,
      y: CENTER.y + Math.sin(a) * RING,
      visible: true,
    });
  });
  return map;
}

interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// A connector clipped to leave a gap at each endpoint's glyph.
function segment(a: Pt, b: Pt): Seg {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { x1: a.x + ux * GAP, y1: a.y + uy * GAP, x2: b.x - ux * GAP, y2: b.y - uy * GAP };
}

// Per-node idle drift — a slow, small Lissajous orbit so the map floats without wandering.
interface Drift {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  px: number;
  py: number;
}

const MOTION: Record<string, Drift> = Object.fromEntries(
  NODES.map((n, i) => [
    n.id,
    {
      ax: 4 + (i % 4) * 1.5,
      ay: 4 + (i % 3) * 1.8,
      sx: 0.34 + (i % 5) * 0.06,
      sy: 0.3 + (i % 4) * 0.05,
      px: i * 1.3,
      py: i * 2.1 + 0.7,
    },
  ]),
);

function driftAt(base: Placed, id: string, t: number): Pt {
  const m = MOTION[id];
  return {
    x: base.x + Math.sin(t * m.sx + m.px) * m.ax,
    y: base.y + Math.cos(t * m.sy + m.py) * m.ay,
  };
}

const DASH = { dot: "1 5", dash: "5 6" } as const;

const S = 8.5; // glyph radius

function polygon(sides: number, r: number, rot: number): string {
  return Array.from({ length: sides }, (_, i) => {
    const a = rot + (i * 2 * Math.PI) / sides;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

// Eight scalloped petals around a filled centre — the accent leaf, always warm.
function flowerPath(): string {
  const petals = 8;
  const offset = 4.8;
  const petalR = 2.9;
  const rings = Array.from({ length: petals }, (_, i) => {
    const a = (i * 2 * Math.PI) / petals;
    const px = Math.cos(a) * offset;
    const py = Math.sin(a) * offset;
    return `M ${px} ${py} m ${-petalR} 0 a ${petalR} ${petalR} 0 1 0 ${petalR * 2} 0 a ${petalR} ${petalR} 0 1 0 ${-petalR * 2} 0`;
  });
  return `${rings.join(" ")} M 0 0 m -3.6 0 a 3.6 3.6 0 1 0 7.2 0 a 3.6 3.6 0 1 0 -7.2 0`;
}

const FLOWER = flowerPath();

// Florian's wordmark, collapsed to the "Fk" monogram — the F and small-k lifted straight from
// the site logo (src/components/shared/logo.tsx). Centred on the combined bbox so it sits on the
// node origin like every other glyph.
const MARK_F = "M1.498 1.62414V4.25614H4.802V5.74014H1.498V9.94014H0V0.140137H5.782V1.62414H1.498Z";
const MARK_K =
  "M9.548 0V5.516L12.25 2.576H14.028L11.424 5.404L14.42 9.8H12.712L10.444 6.468L9.548 7.448V9.8H8.078V0H9.548Z";
const MARK_SCALE = 1.15;
const MARK_CX = 7.21;
const MARK_CY = 4.97;

function Glyph({ node, lit }: { node: GNode; lit: boolean }) {
  // Filled solids — topic nodes keep their own hue; the home mark tracks the neutral state.
  const color = node.color ?? (lit ? "var(--text-primary)" : "var(--text-quaternary)");
  const common = {
    fill: color,
    stroke: color,
    strokeWidth: 0.75,
    strokeLinejoin: "round" as const,
    style: { transition: "fill 0.35s ease, stroke 0.35s ease" },
  };

  if (node.glyph === "logo") {
    return (
      <g
        transform={`scale(${MARK_SCALE}) translate(${-MARK_CX} ${-MARK_CY})`}
        fill={color}
        style={{ transition: "fill 0.35s ease" }}
      >
        <path d={MARK_F} />
        <path d={MARK_K} />
      </g>
    );
  }

  if (node.glyph === "flower") {
    return (
      <path
        d={FLOWER}
        fill={color}
        stroke={color}
        strokeWidth={0.5}
        style={{ transition: "fill 0.35s ease, stroke 0.35s ease" }}
      />
    );
  }

  switch (node.glyph) {
    case "circle":
      return <circle r={S} {...common} />;
    case "square":
      return <rect x={-S} y={-S} width={S * 2} height={S * 2} rx={2} {...common} />;
    case "diamond":
      return <polygon points={polygon(4, S + 2, 0)} {...common} />;
    case "triangle":
      return <polygon points={polygon(3, S + 2.5, -Math.PI / 2)} {...common} />;
    case "hexagon":
      return <polygon points={polygon(6, S + 1, -Math.PI / 2)} {...common} />;
    case "pentagon":
      return <polygon points={polygon(5, S + 1, -Math.PI / 2)} {...common} />;
    default:
      return null;
  }
}

const DEFAULT_CENTER = "florian";
const DRAW = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const;

type PosMap = Record<string, Pt>;

const snapshot = (layout: Map<string, Placed>): PosMap => {
  const p: PosMap = {};
  for (const [id, v] of layout) p[id] = { x: v.x, y: v.y };
  return p;
};

export const NodeMap = () => {
  const coarse = useMediaQuery("(pointer: coarse)");
  const narrow = useMediaQuery("(max-width: 640px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const stackRef = useRef<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  const layout = useMemo(() => layoutFor(center), [center]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  // Smoothed positions: each frame we ease every node toward its layout slot (plus drift). A
  // centre change just moves the targets; the easing turns it into a spring-like re-layout.
  const [positions, setPositions] = useState<PosMap>(() => snapshot(layout));
  const tRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setPositions(snapshot(layoutRef.current));
      return;
    }
    let raf = 0;
    let last = 0;
    const step = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tRef.current += dt;
      const t = tRef.current;
      const k = 1 - Math.exp(-dt * 6);
      setPositions((prev) => {
        const next: PosMap = {};
        for (const n of NODES) {
          const lay = layoutRef.current.get(n.id) as Placed;
          const goal = lay.visible ? driftAt(lay, n.id, t) : { x: CENTER.x, y: CENTER.y };
          const cur = prev[n.id] ?? goal;
          next[n.id] = { x: cur.x + (goal.x - cur.x) * k, y: cur.y + (goal.y - cur.y) * k };
        }
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Snap straight to the new layout for reduced-motion users (no easing frames run).
  useEffect(() => {
    if (reduced) setPositions(snapshot(layout));
  }, [reduced, layout]);

  const neighbors = ADJ.get(center) ?? [];
  const visible = useMemo(() => new Set([center, ...neighbors]), [center, neighbors]);

  // The highlighted connector: the hovered neighbour, or — at rest — a default neighbour, so
  // one thread stays lit like the reference's default path. It takes the target node's hue.
  const defaultNbr = neighbors.find((id) => NODE_BY_ID.get(id)?.default);
  const hi = hovered && visible.has(hovered) && hovered !== center ? hovered : (defaultNbr ?? null);
  const hiColor = hi ? (NODE_BY_ID.get(hi)?.color ?? "var(--text-primary)") : "var(--text-primary)";
  const hiSeg = hi ? segment(positions[center], positions[hi]) : null;

  const go = (id: string) => {
    setHovered(null);
    if (id === center) {
      const prev = stackRef.current.pop();
      if (prev) setCenter(prev);
      return;
    }
    stackRef.current.push(center);
    setCenter(id);
  };

  const visibleEdges = EDGES.filter(([a, b]) => visible.has(a) && visible.has(b));

  // On touch/mobile the container is narrow, so the padded desktop box scales down and leaves the
  // graph small. Crop tight to the content (centred on CENTER, RING plus glyph+label margin) so
  // it fills the width instead.
  const viewBox = narrow ? "165 77 490 490" : "0 0 820 660";

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 select-none">
      <svg
        viewBox={viewBox}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        onPointerLeave={() => !coarse && setHovered(null)}
        aria-label="A floating knowledge graph. Click a node to travel into it; click the centre to go back."
      >
        {/* Resting connectors between every pair of visible nodes. */}
        <g fill="none" strokeLinecap="round">
          {visibleEdges.map(([a, b]) => {
            const s = segment(positions[a], positions[b]);
            return (
              <line
                key={`${a}-${b}`}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="var(--border-secondary)"
                strokeWidth={1.25}
                strokeDasharray={DASH[edgeDash(a, b)]}
                opacity={0.9}
              />
            );
          })}
        </g>

        {/* Highlighted connector, redrawn whenever the centre or highlight changes. */}
        {hiSeg && (
          <motion.line
            key={`${center}-${hi}`}
            x1={hiSeg.x1}
            y1={hiSeg.y1}
            x2={hiSeg.x2}
            y2={hiSeg.y2}
            fill="none"
            stroke={hiColor}
            strokeWidth={1.75}
            strokeLinecap="round"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={DRAW}
          />
        )}

        {NODES.map((node) => {
          const p = positions[node.id];
          const isVisible = visible.has(node.id);
          const isCenter = node.id === center;
          const lit = isCenter || node.id === hi || node.id === hovered;
          return (
            <g
              key={node.id}
              role="button"
              tabIndex={isVisible ? 0 : -1}
              aria-label={isCenter ? `${node.label} (centre — activate to go back)` : node.label}
              className="outline-none [-webkit-tap-highlight-color:transparent]"
              style={{
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? "auto" : "none",
                cursor: "pointer",
                transition: "opacity 0.35s ease",
              }}
              onPointerEnter={() => !coarse && !isCenter && setHovered(node.id)}
              onFocus={() => !isCenter && setHovered(node.id)}
              onBlur={() => setHovered(null)}
              onClick={() => go(node.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  go(node.id);
                }
              }}
            >
              {/* Generous invisible hit target so floating nodes stay easy to catch. */}
              <circle cx={p.x} cy={p.y} r={24} fill="transparent" />
              <g transform={`translate(${p.x} ${p.y})`}>
                <g
                  style={{
                    transform: `scale(${isCenter ? 1.15 : lit ? 1.12 : 1})`,
                    transformOrigin: "center",
                    transformBox: "fill-box",
                    transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <Glyph node={node} lit={lit} />
                </g>
              </g>
              <text
                x={p.x}
                y={p.y + (isCenter ? 30 : 26)}
                textAnchor="middle"
                fontSize={13}
                fontWeight={lit ? 450 : 400}
                fill={lit ? "var(--text-primary)" : "var(--text-quaternary)"}
                style={{ transition: "fill 0.35s ease" }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Credit to the original, styled like the writing-page footnotes (Footnotes in
          mdx-content.tsx): tertiary, superscript marker, domain-only link. */}
      <p
        data-node-credit
        className="pointer-events-none absolute inset-x-0 bottom-3 px-4 text-center text-[11px] leading-relaxed text-tertiary [&_sup]:mr-1 [&_sup]:text-[9px]"
      >
        <sup>1</sup>
        Node graph, after Andrew Trousdale:{" "}
        <a
          href="https://andrewtrousdale.com/nodes/social-intervention/apossible"
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto fw-link underline decoration-tertiary/40 underline-offset-[3px] transition-all duration-200 hover:decoration-tertiary/70 active:no-underline"
        >
          andrewtrousdale.com
        </a>
      </p>
    </div>
  );
};
