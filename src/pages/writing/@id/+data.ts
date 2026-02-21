import { extractHeadings, getContent, getContentSource, isWritingEntry, type WritingEntry } from "@/lib/mdx";
import { useConfig } from "vike-react/useConfig";
import type { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
  const config = useConfig();
  const items = await getContent("writing");
  const itemRaw = items.find((i) => i.slug === pageContext.routeParams.id);

  if (!itemRaw) {
    throw new Error(`Item with ID ${pageContext.routeParams.id} not found`);
  }

  if (!isWritingEntry(itemRaw)) {
    throw new Error(`Item ${pageContext.routeParams.id} is missing required fields`);
  }

  const item: WritingEntry = itemRaw;

  if (typeof item.collaborators === "string") {
    item.collaborators = item.collaborators
      .split(",")
      .map((c: string) => (c.trim().startsWith(" ") ? c.trim().substring(1) : c.trim()));
  } else if (!item.collaborators) {
    item.collaborators = [];
  }

  const source = await getContentSource("writing", item.slug);
  const headings = extractHeadings(source).filter((h) => h.level > 1);

  config({
    title: `${item.title} • Florian - Design Engineer`,
    description: item.description,
    image: `/api/og?title=${item.title}`,
  });

  return {
    slug: item.slug,
    title: item.title,
    description: item.description,
    type: item.type,
    headings,
  };
};
