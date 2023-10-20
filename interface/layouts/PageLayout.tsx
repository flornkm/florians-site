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
      <div class="relative font-sans selection:bg-blue-100 selection:text-blue-500 bg-light-zinc">
        <nav class="sticky lg:top-0 lg:border-b border border-zinc-200 lg:border-b-zinc-100 bg-white z-50 top-[90vh] w-full lg:max-w-none max-w-[90%] mx-auto rounded-full lg:rounded-none shadow-xl shadow-black/5 lg:shadow-none">
          <Navigation />
        </nav>
        <main class="w-full relative max-w-screen-lx mx-auto md:px-10 px-6 min-h-screen">
          {children}
        </main>
        <Footer />
      </div>
    </PageContextProvider>
  )
}
