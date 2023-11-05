export default onPrerenderStart

import {
  sourceLanguageTag,
  availableLanguageTags,
  languageTag,
} from "@inlang/paraglide-js/website"

function onPrerenderStart(prerenderContext: any) {
  const pageContexts = []
  for (const pageContext of prerenderContext.pageContexts) {
    // Duplicate pageContext for each locale
    for (const locale of availableLanguageTags) {
      // Localize URL
      let { urlOriginal } = pageContext
      if (locale !== sourceLanguageTag) {
        urlOriginal = `/${sourceLanguageTag}${pageContext.urlOriginal}`
      }
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
