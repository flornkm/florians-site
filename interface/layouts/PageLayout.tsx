import { JSX } from "preact/jsx-runtime"
import "../../design-system/global.css"
import Navigation from "../components/Navigation"
import { PageContext } from "../../renderer/types"
import { PageContextProvider } from "../../renderer/usePageContext"

export default function PageLayout({
  children,
  pageContext,
}: {
  children: JSX.ElementChildrenAttribute
  pageContext: PageContext
}) {
  return (
    <PageContextProvider pageContext={pageContext}>
      <div class="min-h-[200vh] relative font-sans">
        <header class="sticky top-0 border-b border-b-zinc-100 bg-white z-50">
          <Navigation />
        </header>
        <main class="w-full relative max-w-screen-lx mx-auto md:px-10">
          {children}
        </main>
      </div>
    </PageContextProvider>
  )
}
