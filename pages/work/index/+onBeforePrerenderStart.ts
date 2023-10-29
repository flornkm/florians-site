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
        documentProps: {
          title: "Work | Florian - Design Engineer",
          description:
            "Actual work from my studies, services for cooporations and more. All combined as readable case studies with imagery.",
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
          documentProps: {
            // @ts-ignore
            title: `${project.title} | Florian - Design Engineer`,
            // @ts-ignore
            description: project.description,
            image: `/generated/${project.slug}.jpg`,
          },
        },
      }
    }),
  ]
}
