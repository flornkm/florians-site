import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";

const BASE_URL = "https://floriankiem.com";
const EXCLUDED = ["/imprint", "/privacy-policy"];

const STATIC_PAGES = [
  "/",
  "/about",
  "/contact",
  "/writing",
  "/experiments",
  "/colophon",
  "/send-postcard",
];

async function getContentSlugs(category: string): Promise<string[]> {
  const contentRoot = `./src/content/${category}`;
  const files = await readdir(contentRoot);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const [workSlugs, writingSlugs] = await Promise.all([
    getContentSlugs("work"),
    getContentSlugs("writing"),
  ]);

  const dynamicPages = [
    ...workSlugs.map((s) => `/work/${s}`),
    ...writingSlugs.map((s) => `/writing/${s}`),
  ];

  const allPages = [...STATIC_PAGES, ...dynamicPages].filter(
    (p) => !EXCLUDED.includes(p),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((p) => `  <url><loc>${BASE_URL}${p}</loc></url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  res.status(200).send(xml);
}
