import type { ComponentType } from "react";

export type ContentEntry = {
  slug: string;
  url: string;
  short: boolean;
} & Record<string, string | boolean>;

export type WritingEntry = ContentEntry & {
  title: string;
  description: string;
  type: string;
  collaborators?: string | string[];
};

export function isWritingEntry(entry: ContentEntry): entry is WritingEntry {
  return (
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.type === "string"
  );
}

type MdxModule = {
  default: ComponentType;
  frontmatter: Record<string, string>;
};

const workModules = import.meta.glob("/src/work/*/article.mdx", { eager: true }) as Record<
  string,
  MdxModule
>;
const writingModules = import.meta.glob("/src/writing/*/article.mdx", { eager: true }) as Record<
  string,
  MdxModule
>;

const moduleMap = {
  work: workModules,
  writing: writingModules,
} as const;

// No fs access, so works on both client and server.
export function getContent(category: "work" | "writing"): ContentEntry[] {
  const modules = moduleMap[category];
  const entries: ContentEntry[] = [];

  for (const [filePath, mod] of Object.entries(modules)) {
    const data = mod.frontmatter || {};
    const parts = filePath.split("/");
    const slug = parts[parts.length - 2];

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
