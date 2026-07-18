import {
  HR_STOPS,
  LINE_RAMP,
  NEUTRAL,
  ROUTE_PADDING,
  TEMP_STOPS,
  parsePolyline,
  rampColor,
  seriesColors,
  toRgb,
  type Metric,
  type RoutePath,
} from "@/features/writing/lib/runs";
import { Body3 } from "@/components/design-system/body";
import { cn } from "@/lib/utils";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { arc } from "motion";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type SVGProps,
} from "react";

const DRAW_DURATION = 2.8;

// Endpoint markers are custom marks in the writing icons' artwork language
// (src/features/writing/lib/icon-svg.ts): an accent-filled square plate with the ink
// outline and an ink glyph inside — literals because they're illustration, not theme
// chrome, same exception as the icons. The opaque plate is also the background that keeps
// the mark legible when it sits on top of route lines. Drawn in px units centered on
// (0,0); the parent <g> counter-scales and offsets them beside the route point.
const INK = "#171717";
const PLATE = 16;
// Gap between the route point and the plate's near edge.
const MARKER_OFFSET = PLATE / 2 + 6;

// The ink glyph reads on every ramp color, but on the currentColor fallback plate
// (text-primary, used when a run has no data for the metric) it would vanish — flip the
// glyph to the card background there instead.
function glyphColor(fill: string): string {
  return fill === NEUTRAL ? "var(--bg-secondary)" : INK;
}

function MarkerPlate({ fill }: { fill: string }) {
  return (
    <rect
      x={-PLATE / 2}
      y={-PLATE / 2}
      width={PLATE}
      height={PLATE}
      fill={fill}
      stroke={INK}
      strokeWidth={1.4}
      strokeLinejoin="miter"
    />
  );
}

function StartMarker({ fill }: { fill: string }) {
  return (
    <>
      <MarkerPlate fill={fill} />
      {/* Play triangle, nudged right so it sits optically centered. */}
      <path d="M-1.9 -3.4 L3.5 0 L-1.9 3.4 Z" fill={glyphColor(fill)} stroke="none" />
    </>
  );
}

// Wraps an endpoint glyph in the site's Base UI tooltip, anchored to the SVG marker group. Going
// through Base UI (rather than a hand-drawn SVG label) gives us the shared hover delay, a popup
// portaled to the body so it's never clipped by the route box and always on top, and collision-
// aware placement that flips/shifts near the edges. `offset` places the marker beside the route
// point (negative = left of start, positive = right of finish). The transparent hit rect enlarges
// the target; stroke="none" keeps it from inheriting the svg's currentColor stroke as a border.
function EndpointMarker({
  label,
  offset,
  children,
}: {
  label: string;
  offset: number;
  children: ReactNode;
}) {
  const hit = PLATE / 2 + 3;
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger
        render={(triggerProps) => {
          const props = triggerProps as SVGProps<SVGGElement> & { ref?: Ref<SVGGElement> };
          return (
            <g
              {...props}
              transform={`translate(${offset} 0)`}
              className={cn("cursor-default", props.className)}
            >
              <rect
                x={-hit}
                y={-hit}
                width={hit * 2}
                height={hit * 2}
                fill="transparent"
                stroke="none"
                style={{ pointerEvents: "all" }}
              />
              {children}
            </g>
          );
        }}
      />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={8}>
          <BaseTooltip.Popup
            className={cn(
              "z-50 font-medium bg-surface-inverted text-inverted px-2 py-1 rounded-lg",
              "origin-[var(--transform-origin)]",
              "transition-all duration-50 ease-out",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:translate-y-1",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:translate-y-1",
            )}
          >
            <Body3 className="text-inverted whitespace-nowrap">{label}</Body3>
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

function FinishMarker({ fill }: { fill: string }) {
  const glyph = glyphColor(fill);
  return (
    <>
      <MarkerPlate fill={fill} />
      {/* Flag: filled banner on a stroked pole. */}
      <path d="M-2.5 -4 H3.5 V0.5 H-2.5 Z" fill={glyph} stroke="none" />
      <path d="M-2.5 -4 V4.5" fill="none" stroke={glyph} strokeWidth={1.4} strokeLinecap="round" />
    </>
  );
}

// Tiny burst off the finish flag when the draw lands: a few soft round dots in shades of
// the finish plate's color, no outlines. Deterministic (no randomness) so every replay pops
// identically; angles fan upward, distances/sizes/shades vary just enough to feel loose.
const CONFETTI = [
  { angle: -150, dist: 19, r: 1.4, shade: 0.35 },
  { angle: -122, dist: 26, r: 1.1, shade: -0.2 },
  { angle: -104, dist: 21, r: 1.5, shade: 0.15 },
  { angle: -88, dist: 28, r: 1.1, shade: 0.5 },
  { angle: -72, dist: 23, r: 1.4, shade: 0 },
  { angle: -54, dist: 27, r: 1.1, shade: 0.3 },
  { angle: -32, dist: 20, r: 1.5, shade: -0.15 },
];

// Mix an `rgb(...)` color toward white (positive) or black (negative). Returns the color
// untouched when it can't be parsed — the currentColor fallback plate lands here, giving a
// uniform text-primary burst.
function shadeColor(color: string, amount: number): string {
  const channels = color.match(/\d+/g);
  if (!channels || channels.length < 3) return color;
  const mix = (c: number) => Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount));
  return `rgb(${mix(+channels[0])} ${mix(+channels[1])} ${mix(+channels[2])})`;
}

function FinishConfetti({ color }: { color: string }) {
  // One arc per particle, created once per mount — the returned path carries per-element
  // continuity state, so sharing a single instance across particles would tangle them.
  const paths = useMemo(() => CONFETTI.map(() => arc({ strength: 0.35 })), []);
  return (
    <>
      {CONFETTI.map((particle, i) => {
        const rad = (particle.angle * Math.PI) / 180;
        return (
          <motion.circle
            key={i}
            r={particle.r}
            fill={shadeColor(color, particle.shade)}
            stroke="none"
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos(rad) * particle.dist,
              y: Math.sin(rad) * particle.dist,
              scale: 0.5,
              opacity: 0,
            }}
            transition={{
              duration: 0.7,
              delay: i * 0.02,
              ease: "easeOut",
              path: paths[i],
              opacity: { duration: 0.7, ease: "easeIn" },
            }}
          />
        );
      })}
    </>
  );
}

// The box + animated route line, shared by the /writing/runs feed and the /runs-post view.
// Overlays (metric switch, legend) come in as absolutely-positioned children so each caller
// composes its own chrome around the identical drawing.
export function RouteCanvas({
  path,
  metric,
  temperature,
  temperatures,
  averageHeartRate,
  heartRates,
  replayToken = 0,
  className,
  children,
}: {
  path: RoutePath;
  metric: Metric;
  temperature: number | null;
  temperatures: number[] | null;
  averageHeartRate: number | null;
  heartRates: number[] | null;
  /** Increment to restart the draw animation from zero. */
  replayToken?: number;
  className?: string;
  children?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const dotRef = useRef<SVGRectElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const geom = useMemo(() => parsePolyline(path.d), [path]);
  // Flips when the draw finishes; reveals the end marker in the same instant the tip dot hides.
  const [done, setDone] = useState(false);

  // One color per segment from the metric's absolute scale; runs without a per-point series
  // fall back to a uniform color from the average.
  const segmentColors = useMemo(() => {
    const segmentCount = geom.points.length - 1;
    const series = metric === "temperature" ? temperatures : heartRates;
    if (series && series.length) {
      return seriesColors(metric, series.slice(0, segmentCount));
    }
    const average = metric === "temperature" ? temperature : averageHeartRate;
    const stops = metric === "temperature" ? TEMP_STOPS : HR_STOPS;
    const uniform = average != null ? rampColor(stops, average) : NEUTRAL;
    return Array.from({ length: segmentCount }, () => uniform);
  }, [geom, metric, temperature, temperatures, averageHeartRate, heartRates]);

  // The line scales with the route as it fills the box. Measure the user→screen scale (it shifts
  // with the column width) and size the stroke inversely so it renders at a constant px width.
  const [scale, setScale] = useState(5);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const measure = () => {
      const ctm = group.getScreenCTM();
      if (ctm) setScale(Math.hypot(ctm.a, ctm.b) || 5);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [path]);

  // Draw by growing each segment's own `d` on a plain requestAnimationFrame loop. Only geometry
  // (`d`) changes per frame, which renders identically everywhere — unlike stroke-dash / pathLength
  // / mask / offset-path, which all misbehave on iOS Safari. Segments (vs one path) let each stretch
  // carry its own color for the gradient.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const { points, cum, total } = geom;

    const render = (p: number) => {
      const target = p * total;
      let tip = points[0];
      for (let i = 0; i < points.length - 1; i++) {
        const seg = group.children[i] as SVGPathElement | undefined;
        const a = points[i];
        const b = points[i + 1];
        if (target >= cum[i + 1]) {
          tip = b;
          seg?.setAttribute("d", `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`);
        } else if (target <= cum[i]) {
          seg?.setAttribute("d", "");
        } else {
          const t = (target - cum[i]) / (cum[i + 1] - cum[i] || 1);
          const x = a[0] + (b[0] - a[0]) * t;
          const y = a[1] + (b[1] - a[1]) * t;
          tip = [x, y];
          seg?.setAttribute("d", `M${a[0]} ${a[1]}L${x} ${y}`);
        }
      }
      const dot = dotRef.current;
      if (dot && tip) {
        dot.setAttribute("transform", `translate(${tip[0]} ${tip[1]})`);
      }
    };

    // The dot only exists while the tip is moving — visibility flips imperatively (React never
    // touches the attribute after mount) so it cuts out the instant the draw lands, no fade.
    const setDotVisible = (visible: boolean) => {
      dotRef.current?.setAttribute("visibility", visible ? "visible" : "hidden");
    };

    render(0);
    setDotVisible(false);
    if (reduceMotion) {
      render(1);
      setDone(true);
      return;
    }
    setDone(false);
    if (!inView) return;

    let frame = 0;
    let startTime = 0;
    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const p = Math.min(1, (now - startTime) / (DRAW_DURATION * 1000));
      render(p);
      if (p < 1) {
        setDotVisible(true);
        frame = requestAnimationFrame(tick);
      } else {
        setDotVisible(false);
        setDone(true);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, geom, replayToken]);

  const origin = -ROUTE_PADDING;
  const width = path.w + ROUTE_PADDING * 2;
  const height = path.h + ROUTE_PADDING * 2;
  const viewBox = `${origin} ${origin} ${width} ${height}`;
  const startPoint = geom.points[0];
  const endPoint = geom.points[geom.points.length - 1];
  // Plates sample the line's own gradient at its ends, so they track the metric switch.
  const startColor = segmentColors[0] ?? NEUTRAL;
  const endColor = segmentColors[segmentColors.length - 1] ?? NEUTRAL;
  return (
    <div ref={ref} className={cn("relative", className)}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full text-primary"
        aria-hidden="true"
      >
        {/* Each segment's `d` is set imperatively by the draw loop, so it isn't passed here (React
            would clobber it); only the per-segment color + stroke width flow through props. */}
        <g ref={groupRef}>
          {segmentColors.map((color, i) => (
            <path key={i} stroke={color} strokeWidth={1.5 / scale} />
          ))}
        </g>
        {startPoint && (
          <g transform={`translate(${startPoint[0]} ${startPoint[1]}) scale(${1 / scale})`}>
            <EndpointMarker label="Start" offset={-MARKER_OFFSET}>
              <StartMarker fill={startColor} />
            </EndpointMarker>
          </g>
        )}
        {endPoint && done && (
          <g transform={`translate(${endPoint[0]} ${endPoint[1]}) scale(${1 / scale})`}>
            <EndpointMarker label="Finish" offset={MARKER_OFFSET}>
              <FinishMarker fill={endColor} />
            </EndpointMarker>
            {!reduceMotion && (
              // Burst origin: the top edge of the finish plate.
              <g transform={`translate(${MARKER_OFFSET} ${-PLATE / 2})`}>
                <FinishConfetti color={endColor} />
              </g>
            )}
          </g>
        )}
        {/* Tip square riding the draw, centered on the origin so the render loop can place it
            with a single translate. Transform and visibility are owned by the imperative loop;
            the props only seed the start point and the hidden initial state. fill-primary is
            ink-black in light mode but tracks the theme so it stays visible on the dark bg. */}
        {startPoint && (
          <rect
            ref={dotRef}
            visibility="hidden"
            transform={`translate(${startPoint[0]} ${startPoint[1]})`}
            x={-4 / scale}
            y={-4 / scale}
            width={8 / scale}
            height={8 / scale}
            stroke="none"
            className="fill-primary"
          />
        )}
      </svg>
      {children}
    </div>
  );
}

// Legend for the line colors, cool to warm.
export function ColorLegend({ metric, className }: { metric: Metric; className?: string }) {
  const [low, high] = metric === "temperature" ? ["Cooler", "Warmer"] : ["Easy", "Hard"];
  const gradient = `linear-gradient(to right, ${LINE_RAMP.map(
    (stop) => `${toRgb(stop.rgb)} ${stop.at * 100}%`,
  ).join(", ")})`;
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center gap-2 font-serif text-xs font-normal italic leading-none text-tertiary",
        className,
      )}
    >
      <span>{low}</span>
      <span className="h-1.5 w-14" style={{ background: gradient }} />
      <span>{high}</span>
    </div>
  );
}
