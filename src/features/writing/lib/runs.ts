export type RoutePath = { d: string; w: number; h: number };

export type Run = {
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

export type Metric = "temperature" | "heartrate";

// Keeps the stroke from clipping at the edges of the normalized viewBox.
export const ROUTE_PADDING = 6;

// Neutral fallback when the selected metric has no data for a run — resolves to the SVG's
// own text color (text-primary) so those runs still read as a normal line.
export const NEUTRAL = "currentColor";

export type Ramp = { at: number; rgb: [number, number, number] }[];

// Absolute temperature scale in °C on the accent palette (blue → sage → gold → orange).
export const TEMP_STOPS: Ramp = [
  { at: 0, rgb: [126, 156, 196] },
  { at: 12, rgb: [111, 174, 159] },
  { at: 22, rgb: [202, 168, 74] },
  { at: 32, rgb: [232, 100, 60] },
];

// Absolute heart-rate scale in bpm, anchored to the athlete's Strava HR zones
// (Z1 ≤127, Z2 128–158, Z3 159–174, Z4 175–189, Z5 190+).
export const HR_STOPS: Ramp = [
  { at: 115, rgb: [126, 156, 196] },
  { at: 145, rgb: [111, 174, 159] },
  { at: 172, rgb: [202, 168, 74] },
  { at: 190, rgb: [232, 100, 60] },
];

const SERIES_STOPS: Record<Metric, Ramp> = { temperature: TEMP_STOPS, heartrate: HR_STOPS };

// Palette over 0→1, used only for the legend's gradient bar.
export const LINE_RAMP: Ramp = [
  { at: 0, rgb: [126, 156, 196] },
  { at: 0.38, rgb: [111, 174, 159] },
  { at: 0.7, rgb: [202, 168, 74] },
  { at: 1, rgb: [232, 100, 60] },
];

export function seriesColors(metric: Metric, series: number[]): string[] {
  return series.map((v) => rampColor(SERIES_STOPS[metric], v));
}

export function toRgb([r, g, b]: [number, number, number]): string {
  return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
}

export function rampColor(stops: Ramp, value: number): string {
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

export type RouteGeometry = { points: [number, number][]; cum: number[]; total: number };

// Parse the normalized polyline into points + cumulative arc-lengths.
export function parsePolyline(d: string): RouteGeometry {
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

export function formatKm(meters: number): string {
  return (meters / 1000).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatDuration(seconds: number): { value: string; unit: string } {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return { value: `${hours}:${String(minutes).padStart(2, "0")}`, unit: "hrs" };
  return { value: `${minutes}:${String(seconds % 60).padStart(2, "0")}`, unit: "mins" };
}

// Strava's start_date_local is already the athlete's wall-clock time (with a misleading
// trailing Z), so format the date part directly and pin to UTC to avoid a tz day-shift.
export function formatDate(iso: string): string {
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

export async function fetchRuns(): Promise<Run[]> {
  const res = await fetch("/api/runs");
  if (!res.ok) throw new Error("Failed to load runs");
  const data = (await res.json()) as { runs: Run[] };
  return data.runs;
}
