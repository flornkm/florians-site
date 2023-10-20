export default onBeforeRender

import { PageContextBuiltInServer } from "vike/types"
import { convertMarkdownToHtml, returnContent } from "../../../markdown/convert"
import { render } from "vike/abort"

const rendered = {}

async function onBeforeRender(pageContext: PageContextBuiltInServer) {
  const { slug } = pageContext.routeParams
  const projects = await returnContent("archive")

  for (const project of projects) {
    rendered[project.slug] = await convertMarkdownToHtml(project.url)
  }

  if (!rendered[slug]) throw render(404)

  return {
    pageContext: {
      pageProps: {
        content: rendered[slug],
      },
    },
  }
}
