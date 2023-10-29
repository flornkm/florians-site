export default onBeforePrerenderStart

import { convertMarkdownToHtml, returnContent } from "#markdown/convert"
import { PageContextBuiltInServer } from "vike/types"
import { PostContent, RenderedPosts } from "../types"

const rendered = {} as RenderedPosts

async function onBeforePrerenderStart() {
  const posts = await returnContent("feed")
  for (const post of posts) {
    rendered[post.slug] = (await convertMarkdownToHtml(
      post.url
    )) as unknown as PostContent
  }

  return [
    {
      url: "/feed",
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
    },
    ...posts.map((post) => {
      const url = `/feed/${post.slug}`
      return {
        url,
        pageContext: {
          pageProps: {
            content: rendered[post.slug],
          },
          documentProps: {
            // @ts-ignore
            title: `${post.title} | Florian - Design Engineer`,
            // @ts-ignore
            description: post.description,
            image: `/generated/${post.slug}.jpg`,
          },
        },
      }
    }),
  ]
}
