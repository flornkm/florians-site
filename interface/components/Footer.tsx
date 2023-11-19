import { getLocale } from "#hooks/getLocale"
import { usePageContext } from "../../renderer/usePageContext"
import Bulb from "~icons/eva/bulb-fill"
import LanguagePicker from "./LanguagePicker"
import * as m from "#lang/paraglide/messages"
import { languageTag, sourceLanguageTag } from "#lang/paraglide/runtime"

export default function Footer() {
  const pageContext = usePageContext() as any
  return (
    <footer class="py-16 border-t border-t-zinc-100 dark:border-t-zinc-900">
      <div class="max-w-screen-lx mx-auto md:px-10 px-6 grid lg:grid-cols-5 gap-8">
        <div class="lg:col-span-3 xs:col-span-2 lg:max-w-[170px] max-w-sm">
          <h3 class="font-semibold mb-2">Florian's {m.footer_slogan()}</h3>
          <p class="text-zinc-500 dark:text-zinc-400 mb-8">{m.footer_text()}</p>
          <LanguagePicker position="top" align="left" />
        </div>
        <div class="xl:place-self-end lg:mr-6">
          <h4 class="font-semibold mb-3">{m.footer_title_pages()}</h4>
          <ul class="space-y-2 -ml-1">
            <li>
              {languageTag() === sourceLanguageTag ? (
                <a
                  class={
                    "text-zinc-400 transition-colors font-medium " +
                    (pageContext.urlPathname.replace(getLocale(), "") === "/"
                      ? "text-zinc-600 dark:text-zinc-400"
                      : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
                  }
                  href={getLocale() + "/"}
                >
                  {pageContext.urlPathname.replace(getLocale(), "") === "/" &&
                    "/"}{" "}
                  {m.footer_page_home()}
                </a>
              ) : (
                <a
                  class={
                    "text-zinc-400 transition-colors font-medium " +
                    (pageContext.urlPathname.replace(getLocale(), "/") === "/"
                      ? "text-zinc-600 dark:text-zinc-400"
                      : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
                  }
                  href={(getLocale() + "/").endsWith("/") ? getLocale() : "/"}
                >
                  {pageContext.urlPathname.replace(getLocale(), "/") === "/" &&
                    "/"}{" "}
                  {m.footer_page_home()}
                </a>
              )}
            </li>
            <li>
              <a
                class={
                  "text-zinc-400 transition-colors font-medium " +
                  (pageContext.urlPathname.replace(getLocale(), "") === "/about"
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
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
                  "text-zinc-400 transition-colors font-medium " +
                  (pageContext.urlPathname.replace(getLocale(), "") === "/feed"
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
                }
                href={getLocale() + "/feed"}
              >
                {pageContext.urlPathname.replace(getLocale(), "") === "/feed" &&
                  "/"}{" "}
                {m.footer_page_feed()}
              </a>
            </li>
            <li>
              <a
                class={
                  "text-zinc-400 transition-colors font-medium " +
                  (pageContext.urlPathname.replace(getLocale(), "") ===
                  "/archive"
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
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
                  "text-zinc-400 transition-colors font-medium " +
                  (pageContext.urlPathname.replace(getLocale(), "") ===
                  "/colophon"
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
                }
                href={getLocale() + "/colophon"}
              >
                {pageContext.urlPathname.replace(getLocale(), "") ===
                  "/colophon" && "/"}{" "}
                {m.footer_page_colophon()}
              </a>
            </li>
          </ul>
        </div>
        <div class="xl:place-self-end">
          <h4 class="font-semibold mb-3">{m.footer_title_connect()}</h4>
          <ul class="space-y-2">
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias dark:text-zinc-600 dark:hover:text-zinc-400"
                href="https://twitter.com/flornkm"
              >
                x.com
              </a>
            </li>
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias dark:text-zinc-600 dark:hover:text-zinc-400"
                href="imessage://hello@floriankiem.com"
              >
                {m.link_imessage()}
              </a>
            </li>
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias dark:text-zinc-600 dark:hover:text-zinc-400"
                href="https://www.linkedin.com/in/flornkm/"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias dark:text-zinc-600 dark:hover:text-zinc-400"
                href="mailto:hello@floriankiem.com"
              >
                {m.link_email()}
              </a>
            </li>
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias dark:text-zinc-600 dark:hover:text-zinc-400"
                href="https://github.com/flornkm"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="max-w-screen-lx mx-auto md:px-10 px-6 ">
        <div class="border-b border-dashed border-zinc-200 my-16 dark:border-zinc-900" />
      </div>
      <div class="max-w-screen-lx mx-auto md:px-10 px-6 flex justify-between text-sm md:flex-row flex-col gap-6">
        <ul class="flex space-x-8">
          <li>
            <a
              class={
                "text-zinc-400 transition-colors font-medium " +
                (pageContext.urlPathname.replace(getLocale(), "") === "/imprint"
                  ? "text-zinc-600 dark:text-zinc-400"
                  : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
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
                "text-zinc-400 transition-colors font-medium " +
                (pageContext.urlPathname.replace(getLocale(), "") ===
                "/privacy-policy"
                  ? "text-zinc-600 dark:text-zinc-400"
                  : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
              }
              href={getLocale() + "/privacy-policy"}
            >
              {pageContext.urlPathname.replace(getLocale(), "") ===
                "/privacy-policy" && "/"}{" "}
              {m.footer_page_privacy()}
            </a>
          </li>
        </ul>
        <p class="text-zinc-400 leading-none ml-1 dark:text-zinc-600">
          {m.footer_copyright()} {new Date().getFullYear()}
        </p>
      </div>
      <p class="text-xs mt-12 text-zinc-400 dark:text-zinc-600 text-center px-4">
        <Bulb class="inline-block mb-1 mr-1" /> {m.footer_tip()}
      </p>
    </footer>
  )
}
