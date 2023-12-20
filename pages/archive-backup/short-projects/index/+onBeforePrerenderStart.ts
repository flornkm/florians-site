export default onBeforePrerenderStart

import { ProjectContent, RenderedProjects } from "pages/work/types"
import {
  convertMarkdownToHtml,
  returnContent,
} from "../../../../markdown/convert"

const rendered = {} as RenderedProjects

async function onBeforePrerenderStart() {
  const projects = await returnContent("archive/short-projects")
  for (const project of projects) {
    rendered[project.slug] = (await convertMarkdownToHtml(
      project.url
    )) as unknown as ProjectContent
  }

  return [
    {
      url: "/archive/short-projects",
      pageContext: {
        pageProps: {
          currentFolder: "all",
          projects: projects,
        },
        documentProps: {
          title: "Short Projects Archive | Florian - Design Engineer",
          description:
            "In my short projects archive, you will find some shortened case studies.",
          image: "/images/opengraph/og-image-archive.jpg",
        },
      },
    },
    ...projects.map((project) => {
      const url = `/archive/short-projects/${project.slug}`
      return {
        url,
        pageContext: {
          pageProps: {
            // @ts-ignore
            title: projects.find((x) => x.slug === project.slug)!.title,
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
