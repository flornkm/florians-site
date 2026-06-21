import { Body2 } from "@/components/design-system/body";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

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
      <span className="text-2xl font-[550] tracking-tight text-primary">{value}</span>
      <span className="mt-1 text-xs text-tertiary">{label}</span>
    </div>
  );
}

function RunRoute({ path }: { path: RoutePath | null }) {
  if (!path) return null;

  const origin = -ROUTE_PADDING;
  const viewBox = `${origin} ${origin} ${path.w + ROUTE_PADDING * 2} ${path.h + ROUTE_PADDING * 2}`;
  return (
    <div className="mt-5 h-80 w-full rounded-sm bg-secondary p-4 md:h-96 md:p-8">
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
        {/* Non-scaling stroke keeps the line crisp and thin at any width. */}
        <path d={path.d} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
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
      <span className="text-sm text-tertiary">{formatDate(run.startDate)}</span>
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
            <div className="mt-5 h-80 w-full animate-pulse rounded-sm bg-tertiary md:h-96" />
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
