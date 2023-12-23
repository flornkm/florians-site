// https://vike.com/onRenderClient
export default onRenderClient

import { hydrate, render } from "preact"
import type { PageContext } from "./types"
import "../design-system/global.css"
import PageLayout from "../interface/layouts/PageLayout"
import { inject } from "@vercel/analytics"
import {
  availableLanguageTags,
  onSetLanguageTag,
  setLanguageTag,
  sourceLanguageTag,
} from "#lang/paraglide/runtime"
import type { LanguageTag } from "@inlang/sdk"

async function onRenderClient(pageContext: PageContext) {
  const { Page, pageProps } = pageContext
  inject()

  const page = (
    <PageLayout pageContext={pageContext}>
      {/* @ts-ignore */}
      <Page {...pageProps} />
    </PageLayout>
  )

  const container = document.querySelector("body")

  if (pageContext.isHydration) {
    setLanguageTag(() => {
      return pageContext.languageTag as (typeof availableLanguageTags)[number]
    })

    if (window) {
      // The url contains a language tag for non source language tag routes
      const maybeLanguageTag = window.location.pathname.split("/")[1] as
        | (typeof availableLanguageTags)[number]
        | undefined

      const pathIncludesLanguageTag = maybeLanguageTag
        ? availableLanguageTags.includes(maybeLanguageTag)
        : false
      onSetLanguageTag((newLanguageTag: LanguageTag) => {
        if (pathIncludesLanguageTag) {
          //replace old languageTag with new one
          window.location.pathname = window.location.pathname.replace(
            pageContext.languageTag,
            // if new is source languageTag remove the tag
            newLanguageTag === sourceLanguageTag ? "" : newLanguageTag
          )
        } else {
          window.location.pathname =
            "/" + newLanguageTag + window.location.pathname
        }
      })
    }

    hydrate(page, container as Element)
  } else {
    render(page, container as Element)
  }

  document.title = getPageTitle(pageContext)
}

function getPageTitle(pageContext: PageContext) {
  const title =
    (pageContext.documentProps || {}).title ||
    (pageContext.config || {}).title ||
    "Florian - Design Engineer"
  return title
}
