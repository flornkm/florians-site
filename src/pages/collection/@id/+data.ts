import { useConfig } from "vike-react/useConfig";
import type { PageContextServer } from "vike/types";
import { convertMarkdownToHtml, returnContent } from "../../../markdown/convert";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
  // https://vike.dev/useConfig
  const config = useConfig();

  const items = await returnContent("collection");

  const item = items.find((item) => item.slug === pageContext.routeParams.id) as typeof item & {
    title: string;
    description: string;
    type: string;
  };

  if (!item) {
    throw new Error(`Item with ID ${pageContext.routeParams.id} not found`);
  }

  // Only split if the properties are strings, otherwise set defaults
  if (typeof item.collaborators === "string") {
    item.collaborators = item.collaborators
      .split(",")
      .map((item) => (item.trim().startsWith(" ") ? item.trim().substring(1) : item.trim()));
  } else if (!item.collaborators) {
    item.collaborators = [];
  }

  config({
    title: item.title,
    description: item.description,
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
