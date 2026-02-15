import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export type ContentEntry = {
  slug: string;
  url: string;
  short: boolean;
} & Record<string, string | boolean>;

export type WorkEntry = ContentEntry & {
  title: string;
  description: string;
  cover: string;
  date: string;
  collaborators?: string | string[];
  links?: string | string[];
};

export type CollectionEntry = ContentEntry & {
  title: string;
  description: string;
  type: string;
  collaborators?: string | string[];
};

export type BlogEntry = ContentEntry & {
  title: string;
  description: string;
  date: string;
};

export function isWorkEntry(entry: ContentEntry): entry is WorkEntry {
  return (
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.cover === "string" &&
    typeof entry.date === "string"
  );
}

export function isCollectionEntry(entry: ContentEntry): entry is CollectionEntry {
  return typeof entry.title === "string" && typeof entry.description === "string" && typeof entry.type === "string";
}

export function isBlogEntry(entry: ContentEntry): entry is BlogEntry {
  return typeof entry.title === "string" && typeof entry.description === "string" && typeof entry.date === "string";
}

export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    headings.push({ id, text, level });
  }

  return headings;
}

export async function getContentMeta(
  category: "work" | "collection" | "blog",
  slug: string,
): Promise<{ frontmatter: Record<string, unknown>; headings: Heading[] } | null> {
  const filePath = `./src/content/${category}/${slug}.mdx`;

  try {
    const source = await readFile(filePath, "utf-8");
    const { data, content } = matter(source);
    const headings = extractHeadings(content);
    return { frontmatter: data, headings };
  } catch {
    return null;
  }
}

export async function getContent(category: "work" | "collection" | "blog"): Promise<ContentEntry[]> {
  const contentRoot = `./src/content/${category}`;
  const entries: ContentEntry[] = [];

  const files = await readdir(contentRoot);

  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;

    const source = await readFile(`${contentRoot}/${file}`, "utf-8");
    const { data, content } = matter(source);
    const slug = file.replace(/\.mdx$/, "");

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

    const [monthA, yearA] = dateA.split("/").map((s) => parseInt(s.trim(), 10));
    const [monthB, yearB] = dateB.split("/").map((s) => parseInt(s.trim(), 10));

    if (yearA !== yearB) return yearB - yearA;
    return monthB - monthA;
  });

  return entries;
}
