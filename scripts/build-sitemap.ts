// Generates public/sitemap.xml from the file-based routes plus the writing posts —
// derived, never maintained, same approach as the /sitemap page. New route files and
// posts land here on their own. Runs as part of `bun run build`.
import fs from "node:fs";
import path from "node:path";

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

const writingPaths = fs
  .readdirSync(path.join(ROOT, "src/writing"), { withFileTypes: true })
  .filter(
    (e) => e.isDirectory() && fs.existsSync(path.join(ROOT, "src/writing", e.name, "article.mdx")),
  )
  .map((e) => `/writing/${e.name}`);

const pages = [...new Set([...routePaths(path.join(ROOT, "src/routes")), ...writingPaths])]
  .filter((p) => !EXCLUDED.has(p))
  .sort();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${BASE_URL}${p}</loc></url>`).join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, "public/sitemap.xml"), xml);
console.log(`sitemap.xml: ${pages.length} URLs`);
