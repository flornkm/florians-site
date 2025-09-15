export { onBeforePrerenderStart };

import { returnContent } from "@/lib/convert";

async function onBeforePrerenderStart() {
  const projects = await returnContent("work");
  const projectPageURLs = projects.map((project) => `/work/${project.slug}`);
  return projectPageURLs;
}
