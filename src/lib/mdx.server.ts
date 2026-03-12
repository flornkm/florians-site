import matter from "gray-matter";
import type { ContentEntry } from "./mdx";

// Load raw MDX sources at build time — only imported in server functions
const workSources = import.meta.glob("/src/content/work/*.mdx", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

const writingSources = import.meta.glob("/src/content/writing/*.mdx", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

const sourceMap = {
  work: workSources,
  writing: writingSources,
} as const;

export async function getContentSource(category: "work" | "writing", slug: string): Promise<string> {
  const modulePath = `/src/content/${category}/${slug}.mdx`;
  const raw = sourceMap[category][modulePath];
  if (!raw) throw new Error(`Content not found: ${modulePath}`);
  const { content } = matter(raw);
  return content;
}

export async function getContent(category: "work" | "writing"): Promise<ContentEntry[]> {
  const sources = sourceMap[category];
  const entries: ContentEntry[] = [];

  for (const [filePath, raw] of Object.entries(sources)) {
    const { data, content } = matter(raw);
    const slug = filePath.split("/").pop()!.replace(/\.mdx$/, "");

    entries.push({
      ...data,
      slug,
      url: `/${category}/${slug}`,
      short: content.length < 2000,
    } as ContentEntry);
  }

  entries.sort((a, b) => {
    const dateA = (a as { date?: string }).date;
    const dateB = (b as { date?: string }).date;

    if (!dateA || !dateB) return 0;

    const latestYear = (d: string) => {
      const nums = d.match(/\d{4}/g);
      return nums ? Math.max(...nums.map(Number)) : 0;
    };

    return latestYear(dateB) - latestYear(dateA);
  });

  return entries;
}
