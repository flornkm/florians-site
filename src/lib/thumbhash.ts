import { thumbHashToDataURL } from "thumbhash";

const cache = new Map<string, string>();

export function thumbhashToDataURL(hash: string | null | undefined): string | null {
  if (!hash) return null;
  const cached = cache.get(hash);
  if (cached) return cached;
  const bytes = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));
  const url = thumbHashToDataURL(bytes);
  cache.set(hash, url);
  return url;
}
