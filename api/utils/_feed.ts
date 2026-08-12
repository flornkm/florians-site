import type { StoredRun } from "./_strava.js";

// Countries hidden for now from the public feed, by ISO alpha-2 code (AE covers Dubai). Runs stay
// stored with their country in Firebase. Only the feed withholds them, so unhiding a
// country later is a one-line change with no refetch.
const HIDDEN_COUNTRY_CODES = new Set(["DE", "AE", "NL"]);

// The single definition of which stored runs are publicly visible — used by the /api/runs
// feed and by everything that derives display data from it (e.g. the writing list's
// "newest run" date), so they can never disagree.
export function isPublicRun(run: StoredRun): boolean {
  // Indoor runs synced before the sync-side filter existed may still sit in Firebase
  // until the next sync replaces the node — hide them here too. Route-less runs are
  // treadmill runs (no GPS); VirtualRuns carry a virtual route, so check both.
  if (run.path === null || run.sportType === "VirtualRun") return false;
  return !run.countryCode || !HIDDEN_COUNTRY_CODES.has(run.countryCode);
}
