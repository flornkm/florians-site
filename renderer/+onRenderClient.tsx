// https://vike.com/onRenderClient
export default onRenderClient

import { hydrate, render } from "preact"
import type { PageContext } from "./types"
import "../global.css"

async function onRenderClient(pageContext: PageContext) {
  const { Page, pageProps } = pageContext

  const page = (
    // @ts-ignore
    <Page {...pageProps} />
  )

  const container = document.querySelector("body")

  if (pageContext.isHydration) {
    hydrate(page, container as Element)
  } else {
    render(page, container as Element)
  }
}
