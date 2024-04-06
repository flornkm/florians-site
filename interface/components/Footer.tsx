import { getLocale } from "#hooks/getLocale"
import { usePageContext } from "../../renderer/usePageContext"
import { Bulb } from "#design-system/Icons"
import { LanguagePicker } from "./Picker"
import * as m from "#lang/paraglide/messages"
import { languageTag, sourceLanguageTag } from "#lang/paraglide/runtime"
import { Popup, usePopup } from "./Popup"
import NoPrerender from "./NoPrerender"

export default function Footer() {
  const { isOpen, openPopup, closePopup, popup } = usePopup()
  const pageContext = usePageContext() as any
  return (
    <>
      <footer class="py-16 bg-neutral-100 dark:border-t-neutral-900">
        <div class="w-full mx-auto md:px-10 px-6 grid lg:grid-cols-5 gap-8">
          <div class="max-w-md">
            <h3 class="font-semibold mb-2">Florian's {m.footer_slogan()}</h3>
            <p class="text-neutral-500 dark:text-neutral-400 mb-8">
              {m.footer_text()}
            </p>
            <LanguagePicker position="top" align="left" />
          </div>
          <div class="lg:col-span-3 flex justify-between gap-8 lg:mx-auto w-full max-w-nav lg:mb-0 mb-8">
            <div class="xl:place-self-end lg:mr-6">
              <h4 class="font-semibold mb-3">{m.footer_title_pages()}</h4>
              <ul class="space-y-2 -ml-1">
                <li>
                  {languageTag() === sourceLanguageTag ? (
                    <a
                      class={
                        "text-neutral-400 transition-colors font-medium " +
                        (pageContext.urlPathname.replace(getLocale(), "") ===
                        "/"
                          ? "text-neutral-600 dark:text-neutral-400"
                          : "hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400")
                      }
                      href={getLocale() + "/"}
                    >
                      {pageContext.urlPathname.replace(getLocale(), "") ===
                        "/" && "/"}{" "}
                      {m.footer_page_home()}
                    </a>
                  ) : (
                    <a
                      class={
                        "text-neutral-400 transition-colors font-medium " +
                        (pageContext.urlPathname.replace(getLocale(), "/") ===
                        "/"
                          ? "text-neutral-600 dark:text-neutral-400"
                          : "hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400")
                      }
                      href={
                        (getLocale() + "/").endsWith("/") ? getLocale() : "/"
                      }
                    >
                      {pageContext.urlPathname.replace(getLocale(), "/") ===
                        "/" && "/"}{" "}
                      {m.footer_page_home()}
                    </a>
                  )}
                </li>
                <li>
                  <a
                    class={
                      "text-neutral-400 transition-colors font-medium " +
                      (pageContext.urlPathname.replace(getLocale(), "") ===
                      "/about"
                        ? "text-neutral-600 dark:text-neutral-400"
                        : "hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400")
                    }
                    href={getLocale() + "/about"}
                  >
                    {pageContext.urlPathname.replace(getLocale(), "") ===
                      "/about" && "/"}{" "}
                    {m.footer_page_about()}
                  </a>
                </li>
                <li>
                  <a
                    class={
                      "text-neutral-400 transition-colors font-medium " +
                      (pageContext.urlPathname.replace(getLocale(), "") ===
                      "/feed"
                        ? "text-neutral-600 dark:text-neutral-400"
                        : "hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400")
                    }
                    href={getLocale() + "/feed"}
                  >
                    {pageContext.urlPathname.replace(getLocale(), "") ===
                      "/feed" && "/"}{" "}
                    {m.footer_page_feed()}
                  </a>
                </li>
                <li>
                  <a
                    class={
                      "text-neutral-400 transition-colors font-medium " +
                      (pageContext.urlPathname.replace(getLocale(), "") ===
                      "/archive"
                        ? "text-neutral-600 dark:text-neutral-400"
                        : "hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400")
                    }
                    href={getLocale() + "/archive"}
                  >
                    {pageContext.urlPathname.replace(getLocale(), "") ===
                      "/archive" && "/"}{" "}
                    {m.footer_page_archive()}
                  </a>
                </li>
                <li>
                  <a
                    class={
                      "text-neutral-400 transition-colors font-medium " +
                      (pageContext.urlPathname.replace(getLocale(), "") ===
                      "/colophon"
                        ? "text-neutral-600 dark:text-neutral-400"
                        : "hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400")
                    }
                    href={getLocale() + "/colophon"}
                  >
                    {pageContext.urlPathname.replace(getLocale(), "") ===
                      "/colophon" && "/"}{" "}
                    {m.footer_page_colophon()}
                  </a>
                </li>

                {
                  // TODO Change
                }
                <li>
                  <a
                    class="text-neutral-400 invisible hover:text-neutral-600 transition-colors font-medium cursor-pointer dark:text-neutral-600 dark:hover:text-neutral-400"
                    onClick={() => {
                      openPopup()
                    }}
                  >
                    {m.link_contact()}
                  </a>
                </li>
              </ul>
            </div>
            <div class="xl:place-self-end">
              <h4 class="font-semibold mb-3">{m.footer_title_connect()}</h4>
              <ul class="space-y-2">
                <li>
                  <a
                    class="text-neutral-400 hover:text-neutral-600 transition-colors font-medium cursor-alias dark:text-neutral-600 dark:hover:text-neutral-400"
                    href="https://twitter.com/flornkm"
                  >
                    x.com
                  </a>
                </li>
                <li>
                  <a
                    class="text-neutral-400 hover:text-neutral-600 transition-colors font-medium cursor-alias dark:text-neutral-600 dark:hover:text-neutral-400"
                    href="imessage://hello@floriankiem.com"
                  >
                    {m.link_imessage()}
                  </a>
                </li>
                <li>
                  <a
                    class="text-neutral-400 hover:text-neutral-600 transition-colors font-medium cursor-alias dark:text-neutral-600 dark:hover:text-neutral-400"
                    href="https://www.linkedin.com/in/flornkm/"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    class="text-neutral-400 hover:text-neutral-600 transition-colors font-medium cursor-alias dark:text-neutral-600 dark:hover:text-neutral-400"
                    href="mailto:hello@floriankiem.com"
                  >
                    {m.link_email()}
                  </a>
                </li>
                <li>
                  <a
                    class="text-neutral-400 hover:text-neutral-600 transition-colors font-medium cursor-alias dark:text-neutral-600 dark:hover:text-neutral-400"
                    href="https://github.com/flornkm"
                  >
                    GitHub
                  </a>
                </li>

                <li>
                  <a
                    class="text-neutral-400 hover:text-neutral-600 transition-colors font-medium dark:text-neutral-600 dark:hover:text-neutral-400 cursor-alias"
                    href="https://cal.com/flornkm"
                    target="_blank"
                  >
                    Calcom
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div>
            <p class="text-neutral-400 dark:text-neutral-600 font-mono text-sm">
              {m.footer_tip()}
            </p>
          </div>
        </div>
        <div class="w-full mx-auto md:px-10 px-6 ">
          <div class="border-b border-dashed border-neutral-200 my-16 dark:border-neutral-900" />
        </div>
        <div class="w-full mx-auto md:px-10 px-6 flex justify-between text-sm md:flex-row flex-col gap-6">
          <ul class="flex space-x-8">
            <li>
              <a
                class={
                  "text-neutral-400 transition-colors font-medium " +
                  (pageContext.urlPathname.replace(getLocale(), "") ===
                  "/imprint"
                    ? "text-neutral-600 dark:text-neutral-400"
                    : "hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400")
                }
                href={getLocale() + "/imprint"}
              >
                {pageContext.urlPathname.replace(getLocale(), "") ===
                  "/imprint" && "/"}{" "}
                {m.footer_page_imprint()}
              </a>
            </li>
            <li>
              <a
                class={
                  "text-neutral-400 transition-colors font-medium " +
                  (pageContext.urlPathname.replace(getLocale(), "") ===
                  "/privacy-policy"
                    ? "text-neutral-600 dark:text-neutral-400"
                    : "hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400")
                }
                href={getLocale() + "/privacy-policy"}
              >
                {pageContext.urlPathname.replace(getLocale(), "") ===
                  "/privacy-policy" && "/"}{" "}
                {m.footer_page_privacy()}
              </a>
            </li>
          </ul>
          <p class="text-neutral-400 leading-none ml-1 dark:text-neutral-600">
            {m.footer_copyright()} {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  )
}
