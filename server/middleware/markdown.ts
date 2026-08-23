// Markdown content negotiation for AI agents (acceptmarkdown.com): every page has a
// markdown variant (src/markdownMap.gen.ts, built by scripts/build-markdown.ts) served
// when the request asks for `Accept: text/markdown` or an explicit `.md` path. Both
// the markdown and the HTML document responses carry `Vary: Accept` so CDNs never
// serve one variant from the other's cache entry.
import {
  appendResponseHeader,
  defineEventHandler,
  getRequestHeader,
  getRequestPath,
  setResponseHeader,
  setResponseStatus,
} from "h3";
import {
  MARKDOWN_CONTENT_TYPE,
  isNegotiablePath,
  normalizePathname,
  notFoundMarkdown,
  prefersMarkdown,
} from "../../src/lib/agent-content";
import { markdownPages } from "../../src/markdownMap.gen";

export default defineEventHandler((event) => {
  const method = event.method?.toUpperCase?.() ?? "GET";
  if (method !== "GET" && method !== "HEAD") return;

  const rawPath = getRequestPath(event).split("?")[0] ?? "/";
  if (!isNegotiablePath(rawPath)) return;

  const path = normalizePathname(rawPath);
  const wantsMarkdown =
    /\.md$/i.test(rawPath) || prefersMarkdown(getRequestHeader(event, "accept"));

  if (!wantsMarkdown) {
    // The HTML variant of a negotiated URL: mark it as Accept-dependent for caches.
    if (path in markdownPages) appendResponseHeader(event, "Vary", "Accept");
    return;
  }

  setResponseHeader(event, "Vary", "Accept");
  setResponseHeader(event, "Content-Type", MARKDOWN_CONTENT_TYPE);

  const md = markdownPages[path];
  if (!md) {
    setResponseStatus(event, 404);
    return notFoundMarkdown(path);
  }
  return md.markdown;
});
