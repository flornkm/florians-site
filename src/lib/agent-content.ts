import { SITE_URL } from "@/lib/site";

// Markdown content negotiation for AI agents (acceptmarkdown.com): pages are served
// as text/markdown when the Accept header asks for it, with `Vary: Accept` so CDNs
// cache the HTML and markdown variants separately. Pure helpers, used by the nitro
// middleware (server/middleware/markdown.ts) and covered by bun:test.

export const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

type AcceptEntry = { type: string; q: number };

function parseAccept(accept: string): AcceptEntry[] {
  return accept
    .split(",")
    .map((part) => {
      const [type, ...params] = part.trim().split(";");
      let q = 1;
      for (const param of params) {
        const [key, value] = param.trim().split("=");
        if (key === "q") {
          const parsed = Number.parseFloat(value ?? "");
          q = Number.isNaN(parsed) ? 0 : parsed;
        }
      }
      return { type: (type ?? "").trim().toLowerCase(), q };
    })
    .filter((entry) => entry.type.length > 0);
}

/**
 * True when the Accept header explicitly asks for text/markdown at least as strongly
 * as for text/html. Wildcards alone never trigger markdown — browsers send a
 * star/star catch-all and must keep getting HTML.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  const entries = parseAccept(accept);
  const markdown = entries.find((e) => e.type === "text/markdown");
  if (!markdown || markdown.q <= 0) return false;
  const html = entries.find((e) => e.type === "text/html" || e.type === "application/xhtml+xml");
  return !html || markdown.q >= html.q;
}

/**
 * Maps a request path to the markdown-page key: decodes, drops the query/hash-less
 * trailing slash, and folds an explicit `.md` suffix (`/about.md` -> `/about`,
 * `/index.md` -> `/`) onto the page it names.
 */
export function normalizePathname(pathname: string): string {
  let path = pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    // Malformed escapes stay as-is; they simply won't match a page.
  }
  path = path.replace(/\.md$/i, "");
  if (path === "/index" || path === "") path = "/";
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path;
}

/** True for paths that should never be content-negotiated (APIs, assets, internals). */
export function isNegotiablePath(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/_")) return false;
  // Anything with a non-.md file extension is a static asset (.xml, .txt, .webp, ...).
  const extension = pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  return !extension || extension === "md";
}

/** Markdown body for 404 responses so agents can recover instead of dead-ending. */
export function notFoundMarkdown(pathname: string): string {
  return `# 404 — Page not found

There is no page at \`${pathname}\` on floriankiem.com.

Where to look instead:

- [Home / selected work](${SITE_URL}/)
- [About Florian Kiem](${SITE_URL}/about)
- [Writing](${SITE_URL}/writing)
- [Contact](${SITE_URL}/contact)
- Full page list: [sitemap](${SITE_URL}/sitemap.xml)
- Site overview and usage policy for agents: [llms.txt](${SITE_URL}/llms.txt)

Every page is also available as markdown via the \`Accept: text/markdown\` header.
`;
}
