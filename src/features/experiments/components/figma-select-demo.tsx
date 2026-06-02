import { cn } from "@/lib/utils";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Figma's selection blue and the redline / measurement red.
const BLUE = "#0d99ff";
const RED = "#f24822";

type Rect = { left: number; top: number; width: number; height: number };
type Side = { id: string; label: string };

const ELEMENTS: Side[] = [
  { id: "card", label: "Card" },
  { id: "avatar", label: "Avatar" },
  { id: "title", label: "Title" },
  { id: "description", label: "Description" },
  { id: "button", label: "Button" },
];

// Eight resize handles, positioned by fractional offset along the selection box.
const HANDLES = [
  [0, 0],
  [0.5, 0],
  [1, 0],
  [1, 0.5],
  [1, 1],
  [0.5, 1],
  [0, 1],
  [0, 0.5],
] as const;

type Line = { horizontal: boolean; from: number; to: number; cross: number; dist: number };

const hLine = (from: number, to: number, cross: number): Line => ({
  horizontal: true,
  from,
  to,
  cross,
  dist: Math.round(Math.abs(to - from)),
});
const vLine = (from: number, to: number, cross: number): Line => ({
  horizontal: false,
  from,
  to,
  cross,
  dist: Math.round(Math.abs(to - from)),
});

// The red distance lines between the selected box (A) and the hovered box (B).
// Clearing on an axis → one gap line on that axis (sibling spacing). Overlapping or
// nested on both axes → four inset lines, edge-to-edge (Figma's padding readout).
function measure(a: Rect, b: Rect): Line[] {
  const ar = a.left + a.width;
  const ab = a.top + a.height;
  const br = b.left + b.width;
  const bb = b.top + b.height;
  const cx = a.left + a.width / 2;
  const cy = a.top + a.height / 2;

  const xClear = b.left >= ar || br <= a.left;
  const yClear = b.top >= ab || bb <= a.top;

  if (xClear || yClear) {
    const out: Line[] = [];
    if (xClear) {
      const [from, to] = b.left >= ar ? [ar, b.left] : [br, a.left];
      const top = Math.max(a.top, b.top);
      const bottom = Math.min(ab, bb);
      out.push(hLine(from, to, bottom > top ? (top + bottom) / 2 : cy));
    }
    if (yClear) {
      const [from, to] = b.top >= ab ? [ab, b.top] : [bb, a.top];
      const left = Math.max(a.left, b.left);
      const right = Math.min(ar, br);
      out.push(vLine(from, to, right > left ? (left + right) / 2 : cx));
    }
    return out;
  }

  // Overlapping / nested: four edge-to-edge insets (skip coincident edges).
  return [
    hLine(a.left, b.left, cy),
    hLine(ar, br, cy),
    vLine(a.top, b.top, cx),
    vLine(ab, bb, cx),
  ].filter((l) => l.dist > 0);
}

export const FigmaSelect = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const [rects, setRects] = useState<Map<string, Rect>>(new Map());
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [altDown, setAltDown] = useState(false);

  const register = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      if (node) nodes.current.set(id, node);
      else nodes.current.delete(id);
    },
    [],
  );

  // Read every box relative to the canvas. Cheap and layout is static, so we only
  // remeasure on the events that could move things (mount, resize, interaction).
  const measureAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base = canvas.getBoundingClientRect();
    const next = new Map<string, Rect>();
    for (const { id } of ELEMENTS) {
      const node = nodes.current.get(id);
      if (!node) continue;
      const r = node.getBoundingClientRect();
      next.set(id, {
        left: r.left - base.left,
        top: r.top - base.top,
        width: r.width,
        height: r.height,
      });
    }
    setRects(next);
  }, []);

  useLayoutEffect(() => {
    measureAll();
    const ro = new ResizeObserver(measureAll);
    if (canvasRef.current) ro.observe(canvasRef.current);
    window.addEventListener("resize", measureAll);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureAll);
    };
  }, [measureAll]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.altKey) {
        setAltDown(true);
        measureAll();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (!e.altKey) setAltDown(false);
    };
    const blur = () => setAltDown(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [measureAll]);

  const pick = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    measureAll();
    setSelected(id);
  };

  const selRect = selected ? rects.get(selected) : null;
  const hovRect = hovered && hovered !== selected ? rects.get(hovered) : null;
  const lines = altDown && selRect && hovRect ? measure(selRect, hovRect) : [];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-6 select-none">
      <div
        ref={canvasRef}
        onClick={() => setSelected(null)}
        className={cn(
          "relative grid place-items-center rounded-xl",
          "h-72 w-[19rem] sm:w-[22rem]",
          altDown && "cursor-crosshair",
        )}
      >
        {/* The mock UI — a contact card. Each frame is independently selectable. */}
        <div
          ref={register("card")}
          onClick={pick("card")}
          onMouseEnter={() => setHovered("card")}
          onMouseLeave={() => setHovered(null)}
          className="flex items-center gap-3 rounded-lg bg-white p-3 pr-4 shadow-sm ring-1 ring-black/10 dark:bg-neutral-950 dark:ring-white/10"
        >
          <img
            ref={register("avatar")}
            onClick={pick("avatar")}
            onMouseEnter={(e) => {
              e.stopPropagation();
              setHovered("avatar");
            }}
            src="/images/avatars/florian_kiem.jpg"
            alt="Florian Kiem"
            draggable={false}
            className="size-11 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
          />
          <div className="flex flex-col items-start">
            <span
              ref={register("title")}
              onClick={pick("title")}
              onMouseEnter={(e) => {
                e.stopPropagation();
                setHovered("title");
              }}
              className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
            >
              Florian Kiem
            </span>
            <span
              ref={register("description")}
              onClick={pick("description")}
              onMouseEnter={(e) => {
                e.stopPropagation();
                setHovered("description");
              }}
              className="text-xs text-neutral-500"
            >
              Design Engineer
            </span>
          </div>
          <button
            type="button"
            ref={register("button")}
            onClick={pick("button")}
            onMouseEnter={(e) => {
              e.stopPropagation();
              setHovered("button");
            }}
            className="ml-2 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Follow
          </button>
        </div>

        {/* Overlay: selection chrome + measurements. Never intercepts pointer events. */}
        <div className="pointer-events-none absolute inset-0">
          {/* Hovered outline while measuring — outline only, no handles. */}
          {hovRect && altDown && <Outline rect={hovRect} />}

          {/* Selection box + handles + dimension label. */}
          {selRect && (
            <>
              <Outline rect={selRect} />
              {HANDLES.map(([fx, fy], i) => (
                <span
                  key={i}
                  className="absolute size-[7px] rounded-[1.5px] border bg-white"
                  style={{
                    borderColor: BLUE,
                    left: selRect.left + fx * selRect.width,
                    top: selRect.top + fy * selRect.height,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
              {!altDown && (
                <span
                  className="absolute -translate-x-1/2 whitespace-nowrap rounded-[3px] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white"
                  style={{
                    backgroundColor: BLUE,
                    left: selRect.left + selRect.width / 2,
                    top: selRect.top + selRect.height + 6,
                  }}
                >
                  {Math.round(selRect.width)} × {Math.round(selRect.height)}
                </span>
              )}
            </>
          )}

          {/* Red distance lines. */}
          {lines.map((l, i) => (
            <MeasureLine key={i} line={l} />
          ))}
        </div>
      </div>

      <p className="absolute inset-x-0 bottom-5 text-center text-xs text-tertiary">
        Click to select · Hold{" "}
        <kbd className="rounded border border-secondary px-1 py-px font-sans text-[10px]">⌥</kbd>{" "}
        and hover to measure
      </p>
    </div>
  );
};

function Outline({ rect }: { rect: Rect }) {
  return (
    <span
      className="absolute"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        boxShadow: `0 0 0 1px ${BLUE}`,
      }}
    />
  );
}

function MeasureLine({
  line,
}: {
  line: { horizontal: boolean; from: number; to: number; cross: number; dist: number };
}) {
  const mid = (line.from + line.to) / 2;
  const label = (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[3px] px-1 py-px text-[10px] font-medium tabular-nums text-white"
      style={{
        backgroundColor: RED,
        left: line.horizontal ? mid : line.cross,
        top: line.horizontal ? line.cross : mid,
      }}
    >
      {line.dist}
    </span>
  );

  if (line.horizontal) {
    const left = Math.min(line.from, line.to);
    return (
      <>
        <span
          className="absolute h-px"
          style={{
            left,
            top: line.cross,
            width: Math.abs(line.to - line.from),
            backgroundColor: RED,
          }}
        />
        <Tick x={line.from} y={line.cross} vertical />
        <Tick x={line.to} y={line.cross} vertical />
        {label}
      </>
    );
  }
  const top = Math.min(line.from, line.to);
  return (
    <>
      <span
        className="absolute w-px"
        style={{
          left: line.cross,
          top,
          height: Math.abs(line.to - line.from),
          backgroundColor: RED,
        }}
      />
      <Tick x={line.cross} y={line.from} />
      <Tick x={line.cross} y={line.to} />
      {label}
    </>
  );
}

// Short end-cap perpendicular to the measurement line.
function Tick({ x, y, vertical }: { x: number; y: number; vertical?: boolean }) {
  return (
    <span
      className={cn("absolute", vertical ? "h-[7px] w-px" : "h-px w-[7px]")}
      style={{ left: x, top: y, backgroundColor: RED, transform: "translate(-50%, -50%)" }}
    />
  );
}
