import { Body2 } from "@/components/design-system/body";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconChevronBottom } from "central-icons/IconChevronBottom";
import { useQuery } from "@tanstack/react-query";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

type RoutePath = { d: string; w: number; h: number };

type Run = {
  id: string;
  sportType: string;
  startDate: string;
  distanceMeters: number;
  movingSeconds: number;
  elapsedSeconds: number;
  path: RoutePath | null;
  temperature: number | null;
  temperatures: number[] | null;
  averageHeartRate: number | null;
  heartRates: number[] | null;
  description: string | null;
};

type Metric = "temperature" | "heartrate";

// Keeps the stroke from clipping at the edges of the normalized viewBox.
const ROUTE_PADDING = 6;

// Neutral fallback when the selected metric has no data for a run — resolves to the SVG's
// own text color (text-primary) so those runs still read as a normal line.
const NEUTRAL = "currentColor";

type Ramp = { at: number; rgb: [number, number, number] }[];

// Absolute temperature scale on the site's accent palette (blue → sage → gold → orange),
// used for the uniform-line fallback when a run has no per-point series.
const TEMP_STOPS: Ramp = [
  { at: 0, rgb: [126, 156, 196] }, // cold
  { at: 12, rgb: [111, 174, 159] }, // mild
  { at: 22, rgb: [202, 168, 74] }, // warm
  { at: 32, rgb: [232, 100, 60] }, // hot
];

// The same palette over 0→1, for the line itself. Each run's series is normalized to its
// own min→max before sampling, so even a 1–2°C or few-bpm swing spreads across the full
// palette and reads as a visible gradient — relative within a run, absolute in the readout.
const LINE_RAMP: Ramp = [
  { at: 0, rgb: [126, 156, 196] },
  { at: 0.38, rgb: [111, 174, 159] },
  { at: 0.7, rgb: [202, 168, 74] },
  { at: 1, rgb: [232, 100, 60] },
];

// A run with a nearly flat series shouldn't stretch sensor noise into a full rainbow —
// below this span the gradient stays intentionally mild.
const MIN_SPAN: Record<Metric, number> = { temperature: 2, heartrate: 12 };

// Per-point colors for a series, normalized to its own range (centered when the floor kicks in).
function seriesColors(metric: Metric, series: number[]): string[] {
  let min = Infinity;
  let max = -Infinity;
  for (const v of series) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = Math.max(max - min, MIN_SPAN[metric]);
  const lo = (min + max) / 2 - span / 2;
  return series.map((v) => rampColor(LINE_RAMP, (v - lo) / span));
}

function toRgb([r, g, b]: [number, number, number]): string {
  return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
}

function rampColor(stops: Ramp, value: number): string {
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (value <= first.at) return toRgb(first.rgb);
  if (value >= last.at) return toRgb(last.rgb);
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (value <= b.at) {
      const t = (value - a.at) / (b.at - a.at || 1);
      return toRgb([
        a.rgb[0] + (b.rgb[0] - a.rgb[0]) * t,
        a.rgb[1] + (b.rgb[1] - a.rgb[1]) * t,
        a.rgb[2] + (b.rgb[2] - a.rgb[2]) * t,
      ]);
    }
  }
  return toRgb(last.rgb);
}

type RouteGeometry = { points: [number, number][]; cum: number[]; total: number };

// Parse the normalized polyline into points + cumulative arc-lengths.
function parsePolyline(d: string): RouteGeometry {
  const nums = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  const points: [number, number][] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) points.push([nums[i], nums[i + 1]]);
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  return { points, cum, total: cum[cum.length - 1] || 1 };
}

function formatKm(meters: number): string {
  return (meters / 1000).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatDuration(seconds: number): { value: string; unit: string } {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return { value: `${hours}:${String(minutes).padStart(2, "0")}`, unit: "hrs" };
  return { value: `${minutes}:${String(seconds % 60).padStart(2, "0")}`, unit: "mins" };
}

// Strava's start_date_local is already the athlete's wall-clock time (with a misleading
// trailing Z), so format the date part directly and pin to UTC to avoid a tz day-shift.
function formatDate(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function fetchRuns(): Promise<Run[]> {
  const res = await fetch("/api/runs");
  if (!res.ok) throw new Error("Failed to load runs");
  const data = (await res.json()) as { runs: Run[] };
  return data.runs;
}

function Stat({ value, unit }: { value: string; unit: string }) {
  return (
    <span className="text-2xl font-medium tracking-[-0.02em] text-primary">
      {value} <span className="text-quaternary">{unit}</span>
    </span>
  );
}

const DRAW_DURATION = 2.8;

function RunRoute({
  path,
  metric,
  onMetricChange,
  temperature,
  temperatures,
  heartRates,
}: {
  path: RoutePath | null;
  metric: Metric;
  onMetricChange: (m: Metric) => void;
  temperature: number | null;
  temperatures: number[] | null;
  heartRates: number[] | null;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const geom = useMemo(() => (path ? parsePolyline(path.d) : null), [path]);

  // One color per segment, normalized to the run's own range so even small swings read as a
  // gradient. Temperature falls back to a uniform absolute color for runs without a series.
  const segmentColors = useMemo(() => {
    if (!geom) return [];
    const segmentCount = geom.points.length - 1;
    const series = metric === "temperature" ? temperatures : heartRates;
    if (series && series.length) {
      return seriesColors(metric, series.slice(0, segmentCount));
    }
    const uniform =
      metric === "temperature" && temperature != null
        ? rampColor(TEMP_STOPS, temperature)
        : NEUTRAL;
    return Array.from({ length: segmentCount }, () => uniform);
  }, [geom, metric, temperature, temperatures, heartRates]);

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
    if (!geom || !group) return;
    const { points, cum, total } = geom;

    const render = (p: number) => {
      const target = p * total;
      for (let i = 0; i < points.length - 1; i++) {
        const seg = group.children[i] as SVGPathElement | undefined;
        if (!seg) continue;
        const a = points[i];
        const b = points[i + 1];
        if (target >= cum[i + 1]) {
          seg.setAttribute("d", `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`);
        } else if (target <= cum[i]) {
          seg.setAttribute("d", "");
        } else {
          const t = (target - cum[i]) / (cum[i + 1] - cum[i] || 1);
          seg.setAttribute(
            "d",
            `M${a[0]} ${a[1]}L${a[0] + (b[0] - a[0]) * t} ${a[1] + (b[1] - a[1]) * t}`,
          );
        }
      }
    };

    render(0);
    if (reduceMotion) {
      render(1);
      return;
    }
    if (!inView) return;

    let frame = 0;
    let startTime = 0;
    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const p = Math.min(1, (now - startTime) / (DRAW_DURATION * 1000));
      render(p);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, geom]);

  if (!path) return null;

  const origin = -ROUTE_PADDING;
  const width = path.w + ROUTE_PADDING * 2;
  const height = path.h + ROUTE_PADDING * 2;
  const viewBox = `${origin} ${origin} ${width} ${height}`;
  return (
    <div ref={ref} className="relative mt-5 h-[26rem] w-full bg-secondary p-3 md:h-[34rem] md:p-5">
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
      </svg>

      {/* Map-style controls in the box corners: toggle left, color key right. */}
      <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5">
        <MetricSwitch metric={metric} onChange={onMetricChange} />
      </div>
      <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5">
        <ColorLegend metric={metric} />
      </div>
    </div>
  );
}

// Hanging gutter left of the content column on desktop — shared by the km stat and the
// "AI Summary:" label so their LEFT edges align. The width is sized to the label
// ("AI Summary:" ≈ 5.4rem), keeping both close to the column; wider values (14.1 km)
// overflow rightward into the margin gap, which is harmless. nowrap: absolutely
// positioned boxes shrink-wrap to min-content and would break "5.0 km" in two.
const GUTTER = "md:absolute md:right-full md:top-0 md:mr-3 md:w-[5.5rem] md:whitespace-nowrap";

function RunStats({ run }: { run: Run }) {
  const duration = formatDuration(run.movingSeconds);

  return (
    <div className="relative mx-auto flex w-full max-w-[460px] items-start justify-between">
      <div className="flex items-baseline gap-6">
        {/* Hangs in the left gutter on desktop (over the AI Summary label below), leaving
            the mins stat on the column's left edge; inline next to mins on mobile. */}
        <span className={GUTTER}>
          <Stat value={formatKm(run.distanceMeters)} unit="km" />
        </span>
        <Stat value={duration.value} unit={duration.unit} />
      </div>
      <span className="text-sm text-tertiary">{formatDate(run.startDate)}</span>
    </div>
  );
}

// Legend for the line colors, cool to warm. The line is normalized per run, so the honest
// labels are the range endpoints, not absolute values.
function ColorLegend({ metric }: { metric: Metric }) {
  const [low, high] = metric === "temperature" ? ["Cooler", "Warmer"] : ["Easy", "Hard"];
  // The bar is the real ramp, not an approximation — built from the same stops the line samples.
  const gradient = `linear-gradient(to right, ${LINE_RAMP.map(
    (stop) => `${toRgb(stop.rgb)} ${stop.at * 100}%`,
  ).join(", ")})`;
  return (
    <div
      aria-hidden
      className="flex items-center gap-2 font-serif text-xs font-normal italic leading-none text-tertiary"
    >
      <span>{low}</span>
      <span className="h-1.5 w-14" style={{ background: gradient }} />
      <span>{high}</span>
    </div>
  );
}

// Plain select in the button primitive's ghost (tertiary) style plus a hairline outline,
// sized to sit inside the route box like a map control. The focus outline comes from the
// global :focus-visible rule (same offset ring as buttons), but browsers treat a focused
// <select> as :focus-visible even for mouse focus — so track the modality ourselves and
// mark pointer-initiated focus, which the global rule skips.
function MetricSwitch({ metric, onChange }: { metric: Metric; onChange: (m: Metric) => void }) {
  const pointerDownRef = useRef(false);
  const [pointerFocused, setPointerFocused] = useState(false);

  return (
    <div className="relative">
      <select
        aria-label="Route color metric"
        value={metric}
        onChange={(e) => onChange(e.target.value as Metric)}
        onPointerDown={() => {
          pointerDownRef.current = true;
        }}
        onFocus={() => {
          setPointerFocused(pointerDownRef.current);
          pointerDownRef.current = false;
        }}
        onBlur={() => setPointerFocused(false)}
        onKeyDown={() => setPointerFocused(false)}
        data-focus-via={pointerFocused ? "pointer" : undefined}
        className={cn(
          buttonVariants({ variant: "tertiary", size: "sm" }),
          "appearance-none bg-transparent pl-2 pr-7 shadow-ring-xs",
        )}
      >
        <option value="temperature">°C</option>
        <option value="heartrate">bpm</option>
      </select>
      <IconChevronBottom className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-tertiary" />
    </div>
  );
}

function StatSkeleton({ valueWidth }: { valueWidth: string }) {
  return <div className={cn("h-7 animate-pulse rounded-sm bg-tertiary", valueWidth)} />;
}

// Mirrors the loaded layout exactly: same root <div> (so prose's max-w rule doesn't cap the
// full-width route cards), same spacing, same widths.
function RunsSkeleton() {
  return (
    <div className="not-prose mt-12 w-full">
      <ul className="flex flex-col gap-20">
        {Array.from({ length: 2 }).map((_, index) => (
          <li key={index}>
            <div className="relative mx-auto flex w-full max-w-[460px] items-start justify-between">
              <div className="flex gap-6">
                <span className={GUTTER}>
                  <StatSkeleton valueWidth="w-14" />
                </span>
                <StatSkeleton valueWidth="w-20" />
              </div>
              <div className="h-3.5 w-24 animate-pulse rounded-sm bg-tertiary" />
            </div>
            <div className="mx-auto mt-3 w-full max-w-[460px] space-y-1.5">
              <div className="h-3.5 w-full animate-pulse rounded-sm bg-tertiary" />
              <div className="h-3.5 w-2/3 animate-pulse rounded-sm bg-tertiary" />
            </div>
            <div className="mt-5 h-[26rem] w-full animate-pulse bg-tertiary md:h-[34rem]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Each entry carries its own metric toggle, so one run can show temperature while the
// next shows heart rate.
function RunItem({ run }: { run: Run }) {
  const [metric, setMetric] = useState<Metric>("temperature");
  return (
    <li>
      <RunStats run={run} />
      {run.description && (
        <p className="relative mx-auto mt-3 w-full max-w-[460px] text-balance text-sm leading-[1.5] text-primary">
          {/* Hangs in the left margin on desktop (baseline-aligned via matching text size and
              leading) so the note text keeps the column's left edge; inline on mobile where
              there's no margin to hang into. */}
          <span className={cn("font-serif font-medium italic", GUTTER)}>AI Summary: </span>
          {run.description}
        </p>
      )}
      <RunRoute
        path={run.path}
        metric={metric}
        onMetricChange={setMetric}
        temperature={run.temperature}
        temperatures={run.temperatures}
        heartRates={run.heartRates}
      />
    </li>
  );
}

export function RunsFeed() {
  const { data: runs, isPending, isError } = useQuery({ queryKey: ["runs"], queryFn: fetchRuns });

  if (isPending) return <RunsSkeleton />;
  if (isError) {
    return (
      <Body2 className="not-prose text-tertiary">
        Runs are taking a breather — check back soon.
      </Body2>
    );
  }
  if (runs.length === 0) {
    return <Body2 className="not-prose text-tertiary">No runs synced yet.</Body2>;
  }

  return (
    <div className="not-prose mt-12 w-full">
      <ul className="flex flex-col gap-20">
        {runs.map((run) => (
          <RunItem key={run.id} run={run} />
        ))}
      </ul>
    </div>
  );
}
