import { JSX } from "preact/jsx-runtime"
import "../../design-system/global.css"
import Navigation from "../components/Navigation"
import { PageContext } from "../../renderer/types"
import { PageContextProvider } from "../../renderer/usePageContext"
import Footer from "../components/Footer"

export default function PageLayout({
  children,
  pageContext,
}: {
  children: JSX.ElementChildrenAttribute
  pageContext: PageContext
}) {
  return (
    <PageContextProvider pageContext={pageContext}>
      <div class="relative font-sans selection:bg-blue-100 selection:text-blue-500 bg-light-zinc dark:text-white dark:bg-black dark:selection:bg-blue-900 dark:selection:text-blue-400">
        {/* Change the order of the navigation and content based on screen width to make stickiness to bottom possible */}
        <div class="flex lg:flex-col flex-col-reverse">
          <nav class="sticky lg:top-0 lg:bottom-auto lg:border-t-transparent lg:border-l-transparent lg:border-r-transparent lg:border-b border border-zinc-200 lg:border-b-zinc-100 bg-white z-[51] top-auto bottom-8 mb-8 w-full lg:max-w-none max-w-[90%] mx-auto rounded-full lg:rounded-none shadow-xl shadow-black/5 lg:shadow-none dark:bg-zinc-950 dark:lg:border-b-zinc-900 dark:border-zinc-900">
            <Navigation />
          </nav>
          <main class="w-full relative max-w-screen-lx mx-auto md:px-10 px-6 min-h-screen pt-16 lg:pt-0">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </PageContextProvider>
  )
}
