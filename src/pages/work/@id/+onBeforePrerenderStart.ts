export { onBeforePrerenderStart };

import { getContent } from "@/lib/mdx";

async function onBeforePrerenderStart() {
  const projects = await getContent("work");
  const projectPageURLs = projects.map((project) => `/work/${project.slug}`);
  return projectPageURLs;
}
