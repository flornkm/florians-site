import { languageTag, sourceLanguageTag } from "#lang/paraglide/runtime"

export const getLocale = () => {
  return languageTag() === sourceLanguageTag ? "" : `/${languageTag()}`
}
