import type { ComponentType } from "react";

export type ContentEntry = {
  slug: string;
  url: string;
  short: boolean;
} & Record<string, string | boolean>;

export type WorkEntry = ContentEntry & {
  title: string;
  description: string;
  cover: string | string[];
  date: string;
  collaborators?: string | string[];
  links?: string | string[];
};

export type WritingEntry = ContentEntry & {
  title: string;
  description: string;
  type: string;
  collaborators?: string | string[];
};

export function isWorkEntry(entry: ContentEntry): entry is WorkEntry {
  return (
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    (typeof entry.cover === "string" || Array.isArray(entry.cover)) &&
    typeof entry.date === "string"
  );
}

export function isWritingEntry(entry: ContentEntry): entry is WritingEntry {
  return (
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.type === "string"
  );
}

export type Heading = {
  level: number;
  text: string;
  id: string;
};

export function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];
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
    headings.push({ level, text, id });
  }

  return headings;
}

type MdxModule = {
  default: ComponentType;
  frontmatter: Record<string, string>;
  rawContent: string;
};

// Resolve all MDX content at build time — uses compiled modules with frontmatter exports
const workModules = import.meta.glob("/src/content/work/*.mdx", { eager: true }) as Record<
  string,
  MdxModule
>;
const writingModules = import.meta.glob("/src/content/writing/*.mdx", { eager: true }) as Record<
  string,
  MdxModule
>;

const moduleMap = {
  work: workModules,
  writing: writingModules,
} as const;

/**
 * Get raw markdown content for a specific entry (used for heading extraction).
 * Uses the rawContent export injected by the remarkRawContent plugin.
 */
export function getContentSource(category: "work" | "writing", slug: string): string {
  const modulePath = `/src/content/${category}/${slug}.mdx`;
  const mod = moduleMap[category][modulePath];
  if (!mod) throw new Error(`Content not found: ${modulePath}`);
  return mod.rawContent;
}

/**
 * Get all content entries for a category. Uses compiled MDX module frontmatter
 * so no fs access is needed — works on both client and server.
 */
export function getContent(category: "work" | "writing"): ContentEntry[] {
  const modules = moduleMap[category];
  const entries: ContentEntry[] = [];

  for (const [filePath, mod] of Object.entries(modules)) {
    const data = mod.frontmatter || {};
    const slug = filePath
      .split("/")
      .pop()!
      .replace(/\.mdx$/, "");

    entries.push({
      ...data,
      slug,
      url: `/${category}/${slug}`,
      short: true,
    } as ContentEntry);
  }

  entries.sort((a, b) => {
    const dateA = (a as { date?: string }).date;
    const dateB = (b as { date?: string }).date;

    if (!dateA || !dateB) return 0;

    const latestYear = (d: string | number) => {
      const nums = String(d).match(/\d{4}/g);
      return nums ? Math.max(...nums.map(Number)) : 0;
    };

    return latestYear(dateB) - latestYear(dateA);
  });

  return entries;
}
