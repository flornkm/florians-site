// Generates public/sitemap.xml from the file-based routes plus the writing posts —
// derived, never maintained, same approach as the /sitemap page. New route files and
// posts land here on their own. Runs as part of `bun run build`.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve(import.meta.dirname!, "..");
const BASE_URL = "https://floriankiem.com";
// Legal pages add nothing to search results.
const EXCLUDED = new Set(["/imprint", "/privacy-policy"]);

function routePaths(dir: string, prefix = ""): string[] {
  const paths: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      paths.push(...routePaths(path.join(dir, entry.name), `${prefix}/${entry.name}`));
      continue;
    }
    if (!entry.name.endsWith(".tsx") || entry.name === "__root.tsx" || entry.name.includes("$")) {
      continue;
    }
    const base = entry.name.replace(/\.tsx$/, "");
    paths.push(base === "index" ? prefix || "/" : `${prefix}/${base}`);
  }
  return paths;
}

// YAML parses an unquoted `date: 2026-07-11` into a Date; quoted ones stay strings.
// Either way the sitemap wants a bare W3C date, and anything else is dropped rather
// than guessed at.
function toW3CDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const match = typeof value === "string" ? value.match(/^\d{4}-\d{2}-\d{2}/) : null;
  return match ? match[0] : undefined;
}

// Posts carry their publish date in frontmatter, so they can declare a <lastmod>.
// The static routes have no such record and stay bare — an invented date would only
// teach crawlers to distrust the ones that are real.
const writingEntries = fs
  .readdirSync(path.join(ROOT, "src/writing"), { withFileTypes: true })
  .filter(
    (e) => e.isDirectory() && fs.existsSync(path.join(ROOT, "src/writing", e.name, "article.mdx")),
  )
  .map((e) => {
    const source = fs.readFileSync(path.join(ROOT, "src/writing", e.name, "article.mdx"), "utf8");
    return { path: `/writing/${e.name}`, lastmod: toW3CDate(matter(source).data.date) };
  });

const lastmods = new Map(
  writingEntries.filter((e) => e.lastmod).map((e) => [e.path, e.lastmod!] as const),
);

const pages = [
  ...new Set([...routePaths(path.join(ROOT, "src/routes")), ...writingEntries.map((e) => e.path)]),
]
  .filter((p) => !EXCLUDED.has(p))
  .sort();

const urlEntry = (p: string) => {
  const lastmod = lastmods.get(p);
  return `  <url><loc>${BASE_URL}${p}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
};

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(urlEntry).join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, "public/sitemap.xml"), xml);
console.log(`sitemap.xml: ${pages.length} URLs`);
