export { onBeforePrerenderStart };

import { getContent } from "@/lib/mdx";

async function onBeforePrerenderStart() {
  const items = await getContent("writing");
  const itemPageURLs = items.map((item) => `/writing/${item.slug}`);
  return itemPageURLs;
}
