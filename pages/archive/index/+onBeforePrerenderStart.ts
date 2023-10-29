export default onBeforePrerenderStart

import { ProjectContent, RenderedProjects } from "pages/work/types"
import { convertMarkdownToHtml, returnContent } from "../../../markdown/convert"

const rendered = {} as RenderedProjects

async function onBeforePrerenderStart() {
  const projects = await returnContent("archive")
  for (const project of projects) {
    rendered[project.slug] = (await convertMarkdownToHtml(
      project.url
    )) as unknown as ProjectContent
  }

  return [
    {
      url: "/archive",
      pageContext: {
        pageProps: {
          projects: projects,
        },
      },
    },
    ...projects.map((project) => {
      const url = `/archive/${project.slug}`
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
