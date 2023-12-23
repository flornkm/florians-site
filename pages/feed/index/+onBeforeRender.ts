export default onBeforeRender

import { convertMarkdownToHtml, returnContent } from "#markdown/convert"
import { PostContent, RenderedPosts } from "../types"

const rendered = {} as RenderedPosts

async function onBeforeRender() {
  const posts = await returnContent("feed")

  for (const post of posts) {
    rendered[post.slug] = (await convertMarkdownToHtml(
      post.url
    )) as unknown as PostContent
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
        image: "/images/opengraph/og-image-feed.jpg",
      },
    },
  }
}
