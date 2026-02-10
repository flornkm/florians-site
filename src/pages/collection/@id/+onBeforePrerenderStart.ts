export { onBeforePrerenderStart };

import { getContent } from "@/lib/mdx";

async function onBeforePrerenderStart() {
  const items = await getContent("collection");
  const itemPageURLs = items.map((item) => `/collection/${item.slug}`);
  return itemPageURLs;
}
