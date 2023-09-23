export default onBeforeRender

import type { PageContextBuiltInServer } from "vite-plugin-ssr/types"
import { render } from "vite-plugin-ssr/abort"
import { returnContent } from "../../markdown/convert"

async function onBeforeRender(pageContext: PageContextBuiltInServer) {
  console.log(await returnContent("work"))

  const pageProps = {
    content: "content",
  }
  return {
    pageContext: {
      pageProps,
    },
  }
}
