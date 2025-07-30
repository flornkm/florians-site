import { PageContextServer } from "vike/types";
import { convertMarkdownToHtml, returnContent } from "../../markdown/convert";

export const data = async (_pageContext: PageContextServer) => {
  const items = await returnContent("collection");

  const itemsWithContent = await Promise.all(
    items.map(async (item) => {
      const html = await convertMarkdownToHtml(`/collection/${item.slug}`);

      if (!html) {
        throw new Error(`Failed to convert markdown to html for project ${item.slug}`);
      }

      return {
        ...item,
        content: html as string,
      };
    }),
  );

  return itemsWithContent;
};
