import { usePageContext } from "../../renderer/usePageContext"
import Heart from "~icons/eva/heart-fill"

export default function Footer() {
  const pageContext = usePageContext() as any
  return (
    <footer class="py-16 border-t border-t-zinc-100 dark:border-t-zinc-900">
      <div class="max-w-screen-lx mx-auto md:px-10 px-6 grid lg:grid-cols-5 gap-8">
        <div class="lg:col-span-3 xs:col-span-2 lg:max-w-[170px] max-w-sm">
          <h3 class="font-semibold mb-2">Florian's personal site</h3>
          <p class="text-zinc-500 dark:text-zinc-400">
            <Heart class="inline-block text-sm mb-1 transition-colors hover:text-red-500" />{" "}
            building digital products.
          </p>
        </div>
        <div class="xl:place-self-end lg:mr-7">
          <h4 class="font-medium mb-3">Pages</h4>
          <ul class="space-y-2 -ml-1">
            <li>
              <a
                class={
                  "text-zinc-400 transition-colors font-medium " +
                  (pageContext.urlPathname === "/"
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
                }
                href="/"
              >
                {pageContext.urlPathname === "/" && "/"} Home
              </a>
            </li>
            <li>
              <a
                class={
                  "text-zinc-400 transition-colors font-medium " +
                  (pageContext.urlPathname === "/about"
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
                }
                href="/about"
              >
                {pageContext.urlPathname === "/about" && "/"} About
              </a>
            </li>
            <li>
              <a
                class={
                  "text-zinc-400 transition-colors font-medium " +
                  (pageContext.urlPathname === "/archive"
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
                }
                href="/archive"
              >
                {pageContext.urlPathname === "/archive" && "/"} Archive
              </a>
            </li>
            <li>
              <a
                class={
                  "text-zinc-400 transition-colors font-medium " +
                  (pageContext.urlPathname === "/feed"
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
                }
                href="/feed"
              >
                {pageContext.urlPathname === "/feed" && "/"} Feed
              </a>
            </li>
          </ul>
        </div>
        <div class="xs:place-self-end">
          <h4 class="font-medium mb-3">Connect</h4>
          <ul class="space-y-2">
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias dark:text-zinc-600 dark:hover:text-zinc-400"
                href="/"
              >
                X (Twitter)
              </a>
            </li>
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias dark:text-zinc-600 dark:hover:text-zinc-400"
                href="/about"
              >
                iMessage
              </a>
            </li>
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias dark:text-zinc-600 dark:hover:text-zinc-400"
                href="/side-projects"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias dark:text-zinc-600 dark:hover:text-zinc-400"
                href="/feed"
              >
                Email
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
                (pageContext.urlPathname === "/imprint"
                  ? "text-zinc-600 dark:text-zinc-400"
                  : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
              }
              href="/imprint"
            >
              {pageContext.urlPathname === "/imprint" && "/"} Imprint
            </a>
          </li>
          <li>
            <a
              class={
                "text-zinc-400 transition-colors font-medium " +
                (pageContext.urlPathname === "/privacy-policy"
                  ? "text-zinc-600 dark:text-zinc-400"
                  : "hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400")
              }
              href="/privacy-policy"
            >
              {pageContext.urlPathname === "/privacy-policy" && "/"} Privacy
              Policy
            </a>
          </li>
        </ul>
        <p class="text-zinc-400 leading-none ml-1 dark:text-zinc-600">
          Copyright Florian {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
