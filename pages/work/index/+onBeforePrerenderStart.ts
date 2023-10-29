export default onBeforePrerenderStart

import { convertMarkdownToHtml, returnContent } from "../../../markdown/convert"
import { ProjectContent, RenderedProjects } from "../types"

const rendered = {} as RenderedProjects

async function onBeforePrerenderStart() {
  const projects = await returnContent("work")
  for (const project of projects) {
    rendered[project.slug] = (await convertMarkdownToHtml(
      project.url
    )) as unknown as ProjectContent
  }

  return [
    {
      url: "/work",
      pageContext: {
        pageProps: {
          projects: projects,
        },
      },
    },
    ...projects.map((project) => {
      const url = `/work/${project.slug}`
      return {
        url,
        pageContext: {
          pageProps: {
            content: rendered[project.slug],
          },
        },
      }
    }),
  ]
}
