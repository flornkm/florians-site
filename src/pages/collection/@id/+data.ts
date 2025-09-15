import { convertMarkdownToHtml, isCollectionEntry, returnContent, type CollectionEntry } from "@/lib/convert";
import { useConfig } from "vike-react/useConfig";
import type { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
  // https://vike.dev/useConfig
  const config = useConfig();

  const items = await returnContent("collection");

  const itemRaw = items.find((i) => i.slug === pageContext.routeParams.id);

  if (!itemRaw) {
    throw new Error(`Item with ID ${pageContext.routeParams.id} not found`);
  }

  if (!isCollectionEntry(itemRaw)) {
    throw new Error(`Item ${pageContext.routeParams.id} is missing required fields`);
  }

  const item: CollectionEntry = itemRaw;

  // Only split if the properties are strings, otherwise set defaults
  if (typeof item.collaborators === "string") {
    item.collaborators = item.collaborators
      .split(",")
      .map((item: string) => (item.trim().startsWith(" ") ? item.trim().substring(1) : item.trim()));
  } else if (!item.collaborators) {
    item.collaborators = [];
  }

  config({
    title: `${item.title} • Florian - Design Engineer`,
    description: item.description,
    image: `/api/og?title=${item.title}`,
  });

  // Convert the markdown to html
  const html = await convertMarkdownToHtml(`/collection/${item.slug}`);

  if (!html) {
    throw new Error(`Failed to convert markdown to html for project ${item.slug}`);
  }

  return {
    title: item.title,
    description: item.description,
    type: item.type,
    content: html as string,
  };
};
