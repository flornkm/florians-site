export default onBeforePrerenderStart

import { ProjectContent, RenderedProjects } from "pages/work/types"
import {
  convertMarkdownToHtml,
  returnContent,
} from "../../../../markdown/convert"

const rendered = {} as RenderedProjects

async function onBeforePrerenderStart() {
  const projects = await returnContent("archive/projects")
  for (const project of projects) {
    rendered[project.slug] = (await convertMarkdownToHtml(
      project.url
    )) as unknown as ProjectContent
  }

  return [
    {
      url: "/archive/projects",
      pageContext: {
        pageProps: {
          currentFolder: "all",
          projects: projects,
        },
        documentProps: {
          title: "Projects Archive | Florian - Design Engineer",
          description:
            "In my projects archive, you will find some shortened case studies.",
          image: "/images/opengraph/og-image-archive.jpg",
        },
      },
    },
    ...projects.map((project) => {
      const url = `/archive/projects/${project.slug}`
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
