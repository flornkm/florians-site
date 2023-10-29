export default onBeforeRender

import { PageContextBuiltInServer } from "vike/types"
import { convertMarkdownToHtml, returnContent } from "#markdown/convert"
import { render } from "vike/abort"
import { PageContextCustom } from "renderer/types"

const rendered = {}

async function onBeforeRender(pageContext: PageContextBuiltInServer) {
  const { slug } = pageContext.routeParams
  const projects = await returnContent("work")

  for (const project of projects) {
    rendered[project.slug] = await convertMarkdownToHtml(project.url)
  }

  if (!rendered[slug]) throw render(404)

  return {
    pageContext: {
      pageProps: {
        content: rendered[slug],
      },
      documentProps: {
        title: `${
          projects.find((project) => project.slug === slug).title
        } | Florian - Design Engineer`,
        description: projects.find((project) => project.slug === slug)
          .description,
        image: `/generated/${slug}.jpg`,
      } satisfies PageContextCustom["exports"]["documentProps"],
    },
  }
}
