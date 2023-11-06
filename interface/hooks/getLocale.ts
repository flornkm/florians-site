import {
  languageTag,
  sourceLanguageTag,
} from "@inlang/paraglide-js/florians-site"

export const getLocale = () => {
  return languageTag() === sourceLanguageTag ? "" : `/${languageTag()}`
}
