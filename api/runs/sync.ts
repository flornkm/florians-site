import type { VercelRequest, VercelResponse } from "@vercel/node";
import { timingSafeEqual } from "node:crypto";

import { syncRuns } from "../utils/_strava.js";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch, so guard first.
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function bearer(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

// POST: Apple Shortcut "sync now" on workout-end (WORKOUTS_API_KEY).
// GET: Vercel cron backstop (CRON_SECRET, set automatically on cron invocations).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.statusCode = 405;
    res.json({ error: "Method not allowed" });
    return;
  }

  const expected = req.method === "GET" ? process.env.CRON_SECRET : process.env.WORKOUTS_API_KEY;
  const token = bearer(req);

  if (!expected || !token || !safeEqual(token, expected)) {
    res.statusCode = 401;
    res.json({ error: "Unauthorized" });
    return;
  }

  try {
    const result = await syncRuns();
    res.statusCode = 200;
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error("Run sync failed:", error);
    res.statusCode = 500;
    res.json({ error: "Sync failed" });
  }
}
