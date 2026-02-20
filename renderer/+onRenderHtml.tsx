// https://vike.com/onRenderHtml
export default onRenderHtml

import renderToString from "preact-render-to-string"
import { escapeInject, dangerouslySkipEscape } from "vike/server"
import type { PageContext } from "./types"

async function onRenderHtml(pageContext: PageContext) {
  const { Page, pageProps } = pageContext
  const pageHtml = renderToString(
    // @ts-ignore
    <Page {...pageProps} />
  )

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="/images/icons/florian_favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Florian</title>
      </head>
      <body>
        ${dangerouslySkipEscape(pageHtml)}
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {},
  }
}
