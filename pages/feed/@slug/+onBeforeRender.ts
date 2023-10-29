export default onBeforeRender

import { PageContextBuiltInServer } from "vike/types"
import { convertMarkdownToHtml, returnContent } from "../../../markdown/convert"
import { render } from "vike/abort"
import { PageContextCustom } from "renderer/types"

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
      documentProps: {
        title: `${
          posts.find((post) => post.slug === slug).title
        } | Florian - Design Engineer`,
        description: posts.find((post) => post.slug === slug).description,
        image: `/generated/${slug}.jpg`,
      } satisfies PageContextCustom["exports"]["documentProps"],
    },
  }
}
