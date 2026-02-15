export { onBeforePrerenderStart };

import { getContent } from "@/lib/mdx";

async function onBeforePrerenderStart() {
  const posts = await getContent("blog");
  const postPageURLs = posts.map((post) => `/blog/${post.slug}`);
  return postPageURLs;
}
