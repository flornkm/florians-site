import { getContent, isCollectionEntry, type CollectionEntry } from "@/lib/mdx";
import { useConfig } from "vike-react/useConfig";
import type { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
  const config = useConfig();
  const items = await getContent("collection");
  const itemRaw = items.find((i) => i.slug === pageContext.routeParams.id);

  if (!itemRaw) {
    throw new Error(`Item with ID ${pageContext.routeParams.id} not found`);
  }

  if (!isCollectionEntry(itemRaw)) {
    throw new Error(`Item ${pageContext.routeParams.id} is missing required fields`);
  }

  const item: CollectionEntry = itemRaw;

  if (typeof item.collaborators === "string") {
    item.collaborators = item.collaborators
      .split(",")
      .map((c: string) => (c.trim().startsWith(" ") ? c.trim().substring(1) : c.trim()));
  } else if (!item.collaborators) {
    item.collaborators = [];
  }

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
  };
};
