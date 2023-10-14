import Info from "~icons/eva/info-outline"
import { usePageContext } from "../../renderer/usePageContext"

export default function Footer() {
  const pageContext = usePageContext()
  return (
    <footer class="py-16 border-t border-t-zinc-100">
      <div class="max-w-screen-lx mx-auto md:px-10 px-6 grid lg:grid-cols-7 gap-8">
        <div class="lg:col-span-5 xs:col-span-2 lg:max-w-[170px] max-w-sm">
          <h3 class="font-semibold mb-2">Florian's Personal Site</h3>
          <p class="text-zinc-500">Lorem labore aute veniam id aliqua.</p>
        </div>
        <div class="xl:place-self-end lg:mr-2">
          <h4 class="font-medium mb-3">Pages</h4>
          <ul class="space-y-2">
            <li>
              <a
                class={
                  "text-zinc-400 transition-colors font-medium " +
                  (pageContext.urlPathname === "/"
                    ? "text-zinc-600"
                    : "hover:text-zinc-600")
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
                    ? "text-zinc-600"
                    : "hover:text-zinc-600")
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
                  (pageContext.urlPathname === "/side-projects"
                    ? "text-zinc-600"
                    : "hover:text-zinc-600")
                }
                href="/side-projects"
              >
                {pageContext.urlPathname === "/side-projects" && "/"} Side
                Projects
              </a>
            </li>
            <li>
              <a
                class={
                  "text-zinc-400 transition-colors font-medium " +
                  (pageContext.urlPathname === "/feed"
                    ? "text-zinc-600"
                    : "hover:text-zinc-600")
                }
                href="/feed"
              >
                {pageContext.urlPathname === "/feed" && "/"} Feed
              </a>
            </li>
          </ul>
        </div>
        <div class="xl:place-self-end">
          <h4 class="font-medium mb-3">Connect</h4>
          <ul class="space-y-2">
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium"
                href="/"
              >
                X (Twitter)
              </a>
            </li>
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium"
                href="/about"
              >
                iMessage
              </a>
            </li>
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium"
                href="/side-projects"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium"
                href="/feed"
              >
                E-Mail
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="max-w-screen-lx mx-auto md:px-10 px-6 ">
        <div class="border-b border-dashed border-zinc-200 my-16 st" />
      </div>
      <div class="max-w-screen-lx mx-auto md:px-10 px-6 flex justify-between text-sm xs:flex-row flex-col gap-6">
        <ul class="flex space-x-8">
          <li>
            <a
              class={
                "text-zinc-400 transition-colors font-medium " +
                (pageContext.urlPathname === "/imprint"
                  ? "text-zinc-600"
                  : "hover:text-zinc-600")
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
                  ? "text-zinc-600"
                  : "hover:text-zinc-600")
              }
              href="/privacy-policy"
            >
              {pageContext.urlPathname === "/privacy-policy" && "/"} Privacy
              Policy
            </a>
          </li>
        </ul>
        <p class="text-zinc-400 leading-none">
          <Info class="inline-block mb-0.5" /> Florian{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
