import type { VercelRequest, VercelResponse } from "@vercel/node";

import { db } from "./utils/_firebase.js";
import type { StoredRun } from "./utils/_strava.js";

const runsRef = db.ref("runs");

// Countries hidden for now from the public feed, by ISO alpha-2 code (AE covers Dubai). Runs stay
// stored with their country in Firebase. Only the feed withholds them, so unhiding a
// country later is a one-line change with no refetch.
const HIDDEN_COUNTRY_CODES = new Set(["DE", "AE", "NL"]);

// Public, read-only feed for the live writing post. Only location-safe, pre-normalized
// data lives in Firebase, so nothing here can leak a location.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.json({ error: "Method not allowed" });
    return;
  }

  try {
    const snapshot = await runsRef.once("value");
    const runsMap = (snapshot.val() ?? {}) as Record<string, StoredRun>;
    // Indoor runs synced before the sync-side filter existed may still sit in Firebase
    // until the next sync replaces the node — hide them here too. Route-less runs are
    // treadmill runs (no GPS); VirtualRuns carry a virtual route, so check both.
    const runs = Object.values(runsMap)
      .filter((run) => run.path !== null && run.sportType !== "VirtualRun")
      .filter((run) => !run.countryCode || !HIDDEN_COUNTRY_CODES.has(run.countryCode))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    res.statusCode = 200;
    res.json({ runs });
  } catch (error) {
    console.error("Error fetching runs.", error);
    res.statusCode = 500;
    res.json({ error: "Failed to fetch runs" });
  }
}
