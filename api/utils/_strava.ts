import { db } from "./_firebase.js";
import { decodePolyline, toNormalizedPath, type RoutePath } from "./_polyline.js";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities";

// Only ever sync runs from this date onward (the live post starts in May 2026).
const SYNC_AFTER_EPOCH = Math.floor(Date.UTC(2026, 4, 1) / 1000); // 2026-05-01

const RUN_TYPES = new Set(["Run", "TrailRun", "VirtualRun"]);

export type { RoutePath };

type StravaActivity = {
  id: number;
  sport_type: string;
  start_date: string;
  start_date_local?: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  map?: { summary_polyline?: string };
};

export type StoredRun = {
  id: string;
  sportType: string;
  startDate: string;
  distanceMeters: number;
  movingSeconds: number;
  elapsedSeconds: number;
  path: RoutePath | null;
  syncedAt: string;
};

async function getAccessToken(): Promise<string> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Strava token refresh returned no access_token");
  }
  return data.access_token;
}

async function fetchActivities(accessToken: string): Promise<StravaActivity[]> {
  const all: StravaActivity[] = [];

  for (let page = 1; ; page++) {
    const url = `${STRAVA_ACTIVITIES_URL}?after=${SYNC_AFTER_EPOCH}&per_page=100&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });

    if (!res.ok) {
      throw new Error(`Strava activities fetch failed: ${res.status} ${await res.text()}`);
    }

    const batch = (await res.json()) as StravaActivity[];
    all.push(...batch);
    if (batch.length < 100) break;
  }

  return all;
}

function toStoredRun(activity: StravaActivity, syncedAt: string): StoredRun {
  const polyline = activity.map?.summary_polyline;
  return {
    id: String(activity.id),
    sportType: activity.sport_type,
    startDate: activity.start_date_local ?? activity.start_date,
    distanceMeters: activity.distance,
    movingSeconds: activity.moving_time,
    elapsedSeconds: activity.elapsed_time,
    path: polyline ? toNormalizedPath(decodePolyline(polyline)) : null,
    syncedAt,
  };
}

// Re-syncs the whole window every call (idempotent upsert by Strava id), so a
// missed trigger self-heals on the next run or the daily cron.
export async function syncRuns(): Promise<{ synced: number; total: number }> {
  const accessToken = await getAccessToken();
  const activities = await fetchActivities(accessToken);
  const runs = activities.filter((a) => RUN_TYPES.has(a.sport_type));

  const syncedAt = new Date().toISOString();
  await Promise.all(
    runs.map((activity) => {
      const run = toStoredRun(activity, syncedAt);
      return db.ref(`runs/${run.id}`).set(run);
    }),
  );

  return { synced: runs.length, total: activities.length };
}
