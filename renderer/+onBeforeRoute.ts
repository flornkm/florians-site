import type { LanguageTag } from "@inlang/sdk"
import type { PageContext } from "./types.js"
import {
  sourceLanguageTag,
  availableLanguageTags,
} from "@inlang/paraglide-js/florians-site"

export function onBeforeRoute(pageContext: PageContext) {
  const { url: urlWithoutLanguageTag, languageTag } = i18nRouting(
    pageContext.urlOriginal
  )

  return {
    pageContext: {
      languageTag,
      urlOriginal: urlWithoutLanguageTag,
    },
  }
}

/**
 * Returns the language tag and the url without the language tag to render the correct page.
 */
function i18nRouting(url: string) {
  const urlPaths = url.split("/")

  // first path of route is either / or a language tag
  const maybeLanguageTag = urlPaths[1] as (typeof availableLanguageTags)[number]

  // route is /de, /fr, etc. (a language tag is used)
  if (
    availableLanguageTags
      .filter((tag: LanguageTag) => tag !== sourceLanguageTag)
      .includes(maybeLanguageTag)
  ) {
    return {
      languageTag: maybeLanguageTag,
      // remove the language tag from the url to provide vike with the page to be rendered
      url: "/" + urlPaths.slice(2).join("/"),
    }
  } else {
    return {
      languageTag: sourceLanguageTag,
      url: url,
    }
  }
}
