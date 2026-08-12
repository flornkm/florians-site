// An authored `src/writing/<slug>/icon.svg` is used verbatim; otherwise a deterministic glyph is derived from the slug.

import { fallbackIcon, parseSvg, type PostIcon } from "@/features/writing/lib/icon-svg";

export type { PostIcon };

// Eager + raw so the strings are inlined into the bundle, available on server and client without a fetch.
const iconModules = import.meta.glob("/src/writing/*/icon.svg", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export function resolvePostIcon(slug: string): PostIcon {
  const raw = iconModules[`/src/writing/${slug}/icon.svg`];
  return raw ? parseSvg(raw) : fallbackIcon(slug);
}
