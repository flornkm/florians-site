export default onBeforeRender

import { PageContextBuiltInServer } from "vike/types"
import {
  convertMarkdownToHtml,
  returnContent,
} from "../../../../markdown/convert"
import { render } from "vike/abort"
import { ProjectContent, RenderedProjects } from "pages/work/types"

const rendered = {} as RenderedProjects

async function onBeforeRender(pageContext: PageContextBuiltInServer) {
  const { slug } = pageContext.routeParams
  const projects = await returnContent("archive/short-projects")

  for (const project of projects) {
    rendered[project.slug] = (await convertMarkdownToHtml(
      project.url
    )) as unknown as ProjectContent
  }

  if (!rendered[slug]) throw render(404)

  return {
    pageContext: {
      pageProps: {
        content: rendered[slug],
      },
      documentProps: {
        title: `${
          // @ts-ignore
          projects.find((project) => project.slug === slug)!.title
        } | Florian - Design Engineer`,
        description:
          // @ts-ignore
          projects.find((project) => project.slug === slug)!.description,
        image: `/generated/${slug}.jpg`,
      },
    },
  }
}
