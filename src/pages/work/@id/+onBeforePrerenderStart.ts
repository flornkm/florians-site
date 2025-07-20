export { onBeforePrerenderStart };

import { returnContent } from "../../../markdown/convert";

async function onBeforePrerenderStart() {
  const projects = await returnContent("work");
  const projectPageURLs = projects.map((project) => `/work/${project.slug}`);
  return projectPageURLs;
}
