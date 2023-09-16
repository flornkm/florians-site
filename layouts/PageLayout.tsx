import { JSX } from "preact/jsx-runtime"
import "../design-system/global.css"
import Navigation from "./Navigation"

export default function PageLayout(props: {
  children: JSX.Element
  pageContext: any
}) {
  return (
    <div class="min-h-[200vh] relative font-sans">
      <header class="sticky top-0">
        <Navigation />
      </header>
      <main class="w-full relative max-w-screen-xl mx-auto">
        {props.children}
      </main>
    </div>
  )
}
