export default onBeforeRender

import { PageContextBuiltInServer } from "vike/types"
import { convertMarkdownToHtml, returnContent } from "../../../markdown/convert"
import { render } from "vike/abort"

const rendered = {}

async function onBeforeRender(pageContext: PageContextBuiltInServer) {
  const { slug } = pageContext.routeParams
  const posts = await returnContent("feed")

  for (const post of posts) {
    rendered[post.slug] = await convertMarkdownToHtml(post.url)
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
