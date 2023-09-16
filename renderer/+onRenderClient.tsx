// https://vite-plugin-ssr.com/onRenderClient
export default onRenderClient

import { hydrate, render } from "preact"
import { PageShell } from "./PageShell"
import type { PageContext } from "./types"
import "../design-system/global.css"

async function onRenderClient(pageContext: PageContext) {
  const { Page, pageProps } = pageContext
  const page = (
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  )
  const container = document.querySelector("body")

  if (pageContext.isHydration) {
    hydrate(page, container as Element)
  } else {
    render(page, container as Element)
  }
  document.title = getPageTitle(pageContext)
}

function getPageTitle(pageContext: PageContext) {
  const title =
    (pageContext.config?.documentProps || {}).title ||
    (pageContext.documentProps || {}).title ||
    "Florian - Design Engineer"
  return title
}