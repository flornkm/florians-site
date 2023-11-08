export default onPrerenderStart

import {
  sourceLanguageTag,
  availableLanguageTags,
  languageTag,
} from "@inlang/paraglide-js/florians-site"

async function onPrerenderStart(prerenderContext: any) {
  const pageContexts = []
  for (const pageContext of prerenderContext.pageContexts) {
    // Duplicate pageContext for each locale
    for (const locale of availableLanguageTags) {
      // Localize URL
      let { urlOriginal } = pageContext
      if (locale !== sourceLanguageTag) {
        urlOriginal = `/${locale}${pageContext.urlOriginal}`
      }

      console.log(urlOriginal)
      pageContexts.push({
        ...pageContext,
        urlOriginal,
        // Set pageContext.locale
        languageTag: languageTag(),
      })
    }
  }
  return {
    prerenderContext: {
      pageContexts,
    },
  }
}