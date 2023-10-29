export default onBeforeRender

import { convertMarkdownToHtml, returnContent } from "#markdown/convert"
import { PageContextCustom } from "renderer/types"

const rendered = {}

async function onBeforeRender() {
  const posts = await returnContent("feed")

  for (const post of posts) {
    rendered[post.slug] = await convertMarkdownToHtml(post.url)
  }

  return {
    pageContext: {
      pageProps: {
        posts: posts,
        content: rendered,
      },
      documentProps: {
        title: "Feed | Florian - Design Engineer",
        description:
          "This is my personal feed. A place for collecting my memories, writings and showcasing stuff.",
      } satisfies PageContextCustom["exports"]["documentProps"],
    },
  }
}
