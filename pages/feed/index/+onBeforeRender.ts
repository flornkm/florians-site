export default onBeforeRender

import { returnContent } from "../../../markdown/convert"

async function onBeforeRender() {
  const posts = await returnContent("feed")

  return {
    pageContext: {
      pageProps: {
        posts: posts,
      },
    },
  }
}
