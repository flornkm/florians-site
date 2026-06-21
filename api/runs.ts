import type { VercelRequest, VercelResponse } from "@vercel/node";

import { db } from "./utils/_firebase.js";
import type { StoredRun } from "./utils/_strava.js";

const runsRef = db.ref("runs");

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
    const runs = Object.values(runsMap).sort((a, b) => b.startDate.localeCompare(a.startDate));

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    res.statusCode = 200;
    res.json({ runs });
  } catch (error) {
    console.error("Error fetching runs.", error);
    res.statusCode = 500;
    res.json({ error: "Failed to fetch runs" });
  }
}
