const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

export type RunTemperatures = {
  // °C at the start hour — the per-run readout.
  start: number | null;
  // °C per route point, linearly interpolated across the run's duration from the day's
  // hourly curve. null when there are no points or the archive has no data yet.
  perPoint: number[] | null;
};

// Ambient temperature for a run from Open-Meteo's free historical archive (no API key).
// One request returns the whole day's hourly curve, so the per-point series costs nothing
// extra. Nulls mean "no data" (no GPS fix, or the archive hasn't caught up to a very
// recent date) — callers treat that as missing, not as an error.
export async function fetchRunTemperatures(
  lat: number,
  lng: number,
  startLocalIso: string,
  durationSeconds: number,
  pointCount: number,
): Promise<RunTemperatures> {
  // start_date_local is the athlete's wall clock with a misleading trailing Z; slice the
  // date + time off directly rather than constructing a Date (which would shift the tz).
  const date = startLocalIso.slice(0, 10); // YYYY-MM-DD
  const startHour = Number(startLocalIso.slice(11, 13)) + Number(startLocalIso.slice(14, 16)) / 60;
  const url =
    `${ARCHIVE_URL}?latitude=${lat}&longitude=${lng}` +
    `&start_date=${date}&end_date=${date}&hourly=temperature_2m&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { start: null, perPoint: null };
    const data = (await res.json()) as {
      hourly?: { temperature_2m?: (number | null)[] };
    };
    const hourly = data.hourly?.temperature_2m;
    if (!hourly || hourly.every((t) => typeof t !== "number")) {
      return { start: null, perPoint: null };
    }

    // Sample the hourly curve at an arbitrary hour-of-day (clamped to the same day).
    const at = (hour: number): number | null => {
      const clamped = Math.min(Math.max(hour, 0), hourly.length - 1);
      const lo = hourly[Math.floor(clamped)];
      const hi = hourly[Math.min(Math.ceil(clamped), hourly.length - 1)];
      if (typeof lo !== "number" || typeof hi !== "number") return null;
      return lo + (hi - lo) * (clamped - Math.floor(clamped));
    };

    const start = at(startHour);
    const perPoint =
      pointCount > 1
        ? Array.from({ length: pointCount }, (_, i) => {
            const hour = startHour + ((i / (pointCount - 1)) * durationSeconds) / 3600;
            const temp = at(hour);
            return temp == null ? null : Math.round(temp * 10) / 10;
          })
        : null;

    return {
      start: start == null ? null : Math.round(start * 10) / 10,
      // A single missing hour poisons the series; fall back to no gradient rather than holes.
      perPoint: perPoint && perPoint.every((t): t is number => t != null) ? perPoint : null,
    };
  } catch {
    return { start: null, perPoint: null };
  }
}
