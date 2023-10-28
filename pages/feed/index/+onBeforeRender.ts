export default onBeforeRender

import { convertMarkdownToHtml, returnContent } from "#markdown/convert"

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
    },
  }
}
