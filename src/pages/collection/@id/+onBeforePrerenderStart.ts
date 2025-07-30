export { onBeforePrerenderStart };

import { returnContent } from "../../../markdown/convert";

async function onBeforePrerenderStart() {
  const items = await returnContent("collection");
  const itemPageURLs = items.map((item) => `/collection/${item.slug}`);
  return itemPageURLs;
}
