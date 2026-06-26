import { Body2 } from "@/components/design-system/body";
import { cn } from "@/lib/utils";
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
};

// Keeps the stroke from clipping at the edges of the normalized viewBox.
const ROUTE_PADDING = 6;

// Colors from the /writing/runs post icon, so the tracing pointer reads as the same accent.
const ROUTE_POINTER_FILL = "#6fae9f";
const ROUTE_POINTER_BORDER = "#171717";

// Rendered half-length of the pointer, in CSS px. Kept constant across routes by sizing the
// arrow geometry against the measured user→screen scale (see RunRoute).
const POINTER_SIZE_PX = 8;

// An arrowhead pointing along +x (rotated to the path heading at render time), centered on the
// origin so it rides the route at its current point. `size` is in viewBox units.
function pointerPath(size: number): string {
  const tip = size;
  const back = -size * 0.7;
  const wing = size * 0.82;
  const notch = -size * 0.25;
  return `M ${tip} 0 L ${back} ${-wing} L ${notch} 0 L ${back} ${wing} Z`;
}

type RouteGeometry = { points: [number, number][]; cum: number[]; total: number };

// Parse the normalized polyline into points + cumulative arc-lengths. The draw grows the path's
// own `d` (pure geometry) rather than animating stroke-dash / pathLength / mask / offset-path — all
// of which misrender on iOS Safari. setAttribute("d", …) renders identically everywhere.
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

// The route drawn up to progress p (0→1 along arc-length): the partial `d`, plus the leading
// point and heading so the marker can ride the tip.
function routeAtProgress(geom: RouteGeometry, p: number) {
  const { points, cum, total } = geom;
  const start = points[0];
  const target = p * total;
  if (target <= 0) return { d: "", x: start[0], y: start[1], angle: 0 };

  let i = 0;
  while (i < points.length - 2 && cum[i + 1] < target) i++;
  const a = points[i];
  const b = points[i + 1] ?? a;
  const segLength = cum[i + 1] - cum[i] || 1;
  const t = Math.min(1, Math.max(0, (target - cum[i]) / segLength));
  const x = a[0] + (b[0] - a[0]) * t;
  const y = a[1] + (b[1] - a[1]) * t;

  let d = `M${start[0]} ${start[1]}`;
  for (let k = 1; k <= i; k++) d += `L${points[k][0]} ${points[k][1]}`;
  d += `L${x} ${y}`;
  const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return { d, x, y, angle };
}

function formatKm(meters: number): string {
  return (meters / 1000).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-2xl fw-medium tracking-[-0.02em] text-primary">{value}</span>
      <span className="mt-1 text-xs text-tertiary">{label}</span>
    </div>
  );
}

const DRAW_DURATION = 2.8;

function RunRoute({ path }: { path: RoutePath | null }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const arrowRef = useRef<SVGPathElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const geom = useMemo(() => (path ? parsePolyline(path.d) : null), [path]);

  // The line and arrow both scale with the route as it fills the box. Measure the user→screen
  // scale (it shifts with the column width) and size them inversely so they render at a constant px.
  const [scale, setScale] = useState(5);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const measure = () => {
      const ctm = line.getScreenCTM();
      if (ctm) setScale(Math.hypot(ctm.a, ctm.b) || 5);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [path]);

  // Draw the line by growing its own `d` and ride the marker on the tip, from one 0→1 progress on a
  // plain requestAnimationFrame loop. Only geometry (`d`) and a transform change per frame — both
  // render identically in every browser, unlike stroke-dash / pathLength / mask / offset-path, which
  // all misbehave on iOS Safari.
  useEffect(() => {
    const line = lineRef.current;
    if (!geom) return;

    const render = (p: number) => {
      const state = routeAtProgress(geom, p);
      line?.setAttribute("d", state.d);
      const arrow = arrowRef.current;
      if (!arrow) return;
      arrow.setAttribute("transform", `translate(${state.x} ${state.y}) rotate(${state.angle})`);
      // Fade in at the start, ride the tip, fade out into the finish.
      const fade = p <= 0.06 ? p / 0.06 : p >= 0.88 ? Math.max(0, (1 - p) / 0.12) : 1;
      arrow.style.opacity = String(fade);
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
    <div
      ref={ref}
      className="mt-5 h-[26rem] w-full rounded-sm bg-secondary p-3 md:h-[34rem] md:p-5"
    >
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
        {/* `d` is set imperatively by the draw loop, so it isn't passed here (React would clobber it). */}
        <path ref={lineRef} strokeWidth={1.5 / scale} />
        {/* A green arrow rides the leading edge of the draw, pointing the way the route is run
            (heading sampled from the path), then fades out at the finish. Positioned imperatively
            via a transform; its border stays crisp via non-scaling-stroke. */}
        <path
          ref={arrowRef}
          d={pointerPath(POINTER_SIZE_PX / scale)}
          fill={ROUTE_POINTER_FILL}
          stroke={ROUTE_POINTER_BORDER}
          strokeWidth={1.4}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ opacity: 0 }}
        />
      </svg>
    </div>
  );
}

function RunStats({ run }: { run: Run }) {
  return (
    <div className="mx-auto flex w-full max-w-[460px] items-start justify-between">
      <div className="flex gap-6">
        <Stat value={formatKm(run.distanceMeters)} label="km" />
        <Stat value={formatDuration(run.movingSeconds)} label="duration" />
      </div>
      <span className="text-sm text-tertiary tracking-[-0.02em]">{formatDate(run.startDate)}</span>
    </div>
  );
}

function StatSkeleton({ valueWidth }: { valueWidth: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn("h-7 animate-pulse rounded-sm bg-tertiary", valueWidth)} />
      <div className="h-2.5 w-8 animate-pulse rounded-sm bg-tertiary" />
    </div>
  );
}

// Mirrors the loaded layout exactly: same root <div> (so prose's max-w rule doesn't cap the
// full-width route cards), same spacing, same widths.
function RunsSkeleton() {
  return (
    <div className="not-prose mt-12 w-full">
      <ul className="flex flex-col gap-16">
        {Array.from({ length: 2 }).map((_, index) => (
          <li key={index}>
            <div className="mx-auto flex w-full max-w-[460px] items-start justify-between">
              <div className="flex gap-6">
                <StatSkeleton valueWidth="w-14" />
                <StatSkeleton valueWidth="w-20" />
              </div>
              <div className="h-3.5 w-24 animate-pulse rounded-sm bg-tertiary" />
            </div>
            <div className="mt-5 h-[26rem] w-full animate-pulse rounded-sm bg-tertiary md:h-[34rem]" />
          </li>
        ))}
      </ul>
    </div>
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
      <ul className="flex flex-col gap-16">
        {runs.map((run) => (
          <li key={run.id}>
            <RunStats run={run} />
            <RunRoute path={run.path} />
          </li>
        ))}
      </ul>
    </div>
  );
}
