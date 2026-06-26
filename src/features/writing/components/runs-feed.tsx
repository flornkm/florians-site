import { Body2 } from "@/components/design-system/body";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

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

// An arrowhead pointing along +x — the direction offset-path orients to — centered on the
// origin so it rides the route at its current point. `size` is in viewBox units.
function pointerPath(size: number): string {
  const tip = size;
  const back = -size * 0.7;
  const wing = size * 0.82;
  const notch = -size * 0.25;
  return `M ${tip} 0 L ${back} ${-wing} L ${notch} 0 L ${back} ${wing} Z`;
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

function RunRoute({ path }: { path: RoutePath | null }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const maskId = `route-${useId().replace(/:/g, "")}`;
  // The arrow is a filled shape, so unlike the non-scaling line it grows with the route. Measure
  // the user→screen scale (it shifts with the column width) and size the arrow inversely so it
  // renders at a constant px on every card.
  const [scale, setScale] = useState(5);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const measure = () => {
      const ctm = el.getScreenCTM();
      if (ctm) setScale(Math.hypot(ctm.a, ctm.b) || 5);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [path]);

  if (!path) return null;

  const origin = -ROUTE_PADDING;
  const width = path.w + ROUTE_PADDING * 2;
  const height = path.h + ROUTE_PADDING * 2;
  const viewBox = `${origin} ${origin} ${width} ${height}`;
  const drawn = reduceMotion || inView;
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
        {/* The visible line keeps a constant 1.5px via non-scaling-stroke, but that decouples a
            stroke-dash draw from the viewBox units. So the Strava-style reveal is done with a
            wide masking stroke that DOES scale with the route: as motion animates its pathLength
            from 0→1 it uncovers the thin line beneath, no per-route length measurement needed. */}
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={origin}
          y={origin}
          width={width}
          height={height}
        >
          <motion.path
            d={path.d}
            stroke="white"
            strokeWidth={3}
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: drawn ? 1 : 0 }}
            transition={{ duration: 2.8, ease: "linear" }}
          />
        </mask>
        <path
          ref={lineRef}
          d={path.d}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          mask={`url(#${maskId})`}
        />
        {/* A green arrow rides the leading edge of the draw, pointing the way the route is being
            run (offset-path auto-rotates it to the path's heading), then fades out as it reaches
            the finish. Sized via the measured scale so it stays present and constant; its border
            stays crisp via non-scaling-stroke. */}
        <motion.path
          d={pointerPath(POINTER_SIZE_PX / scale)}
          fill={ROUTE_POINTER_FILL}
          stroke={ROUTE_POINTER_BORDER}
          strokeWidth={1.4}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ offsetPath: `path('${path.d}')` }}
          initial={reduceMotion ? false : { offsetDistance: "0%", opacity: 0 }}
          animate={
            drawn && !reduceMotion
              ? { offsetDistance: "100%", opacity: [0, 1, 1, 0] }
              : { offsetDistance: "0%", opacity: 0 }
          }
          transition={{
            duration: 2.8,
            ease: "linear",
            opacity: { duration: 2.8, ease: "linear", times: [0, 0.06, 0.88, 1] },
          }}
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
