// Manually trigger a runs sync from your machine (reads .env). Does exactly what the
// Apple Shortcut and the daily cron do: pull from Strava → upsert into Firebase.
//   bun scripts/sync-runs.ts

import { syncRuns } from "../api/utils/_strava";

syncRuns()
  .then((result) => {
    console.log(`Synced ${result.synced} runs (of ${result.total} activities since May 2026).`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
