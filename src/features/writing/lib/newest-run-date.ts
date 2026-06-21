// Server-side only (called inside createServerFn handlers): the live "runs" post has no
// frontmatter date and takes its date from the newest synced run. Reads Firebase directly
// so it works in every environment. Returns null on failure → callers fall back gracefully.
import { db } from "../../../../api/utils/_firebase";

export async function fetchNewestRunDate(): Promise<string | null> {
  try {
    const snapshot = await db.ref("runs").once("value");
    const runs = Object.values((snapshot.val() ?? {}) as Record<string, { startDate: string }>);
    if (runs.length === 0) return null;
    const newest = runs.reduce(
      (latest, run) => (run.startDate > latest ? run.startDate : latest),
      runs[0].startDate,
    );
    return newest.slice(0, 10);
  } catch {
    return null;
  }
}
