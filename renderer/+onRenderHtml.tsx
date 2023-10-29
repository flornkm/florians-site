// https://vike.com/onRenderHtml
export default onRenderHtml

import renderToString from "preact-render-to-string"
import { escapeInject, dangerouslySkipEscape } from "vike/server"
import faviconUrl from "./favicon.svg"
import type { PageContext } from "./types"
import PageLayout from "../interface/layouts/PageLayout"

async function onRenderHtml(pageContext: PageContext) {
  const { Page, pageProps } = pageContext
  const pageHtml = renderToString(
    <PageLayout pageContext={pageContext}>
      {/* @ts-ignore */}
      <Page {...pageProps} />
    </PageLayout>
  )

  // See https://vike.com/head
  const { documentProps, config } = pageContext
  const title =
    (documentProps && documentProps.title) ||
    (config && config.title) ||
    "Florian - Design Engineer"
  const desc =
    (documentProps && documentProps.description) ||
    (config && config.description) ||
    "Florians Personal Website."
  const image =
    (documentProps && documentProps.image) ||
    (config && config.image) ||
    "/images/opengraph/og-image.jpg"
  const index = (config && config.noindex) || undefined

  const documentHtml = escapeInject`<!DOCTYPE html>
  <!-- Designed and coded by myself • Florian -->
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${faviconUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <meta property="og:image" content="https://florians-site-preview.vercel.app${image}" />
        <meta property="og:description" content="${desc}" />
        <meta property="og:title" content="${title}" />
        <meta name="twitter:card" content="summary" />
        <meta property="twitter:image" content="https://florians-site-preview.vercel.app${image}" />
        <meta property="twitter:description" content="${desc}" />
        <meta property="twitter:title" content="${title}" />
        <meta name="twitter:site" content="@floriandwt" />
        <meta name="twitter:creator" content="@floriandwt" />
        ${index ? escapeInject`<meta name="robots" content="noindex">` : ""}
        <title>${title}</title>
      </head>
      <body>
        ${dangerouslySkipEscape(pageHtml)}
      </body>
    </html>
<!-- 
    ____  __    _____  ____  ____    __    _  _   
    ( ___)(  )  (  _  )(  _ \(_  _)  /__\  ( \( )  
     )__)  )(__  )(_)(  )   / _)(_  /(__)\  )  (   
    (__)  (____)(_____)(_)\_)(____)(__)(__)(_)\_)  
-->`

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vike.com/page-redirection
    },
  }
}
