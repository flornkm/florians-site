export default onBeforePrerenderStart

import { convertMarkdownToHtml, returnContent } from "#markdown/convert"

const rendered = {}

async function onBeforePrerenderStart() {
  const posts = await returnContent("feed")
  for (const post of posts) {
    rendered[post.slug] = await convertMarkdownToHtml(post.url)
  }

  return [
    {
      url: "/feed",
      pageContext: {
        pageProps: {
          posts: posts,
          content: rendered,
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
        },
      }
    }),
  ]
}
