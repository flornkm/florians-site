import { JSX } from "preact/jsx-runtime"
import "../design-system/global.css"
import Navigation from "./Navigation"

export default function PageLayout(props: {
  children: JSX.Element
  pageContext: any
}) {
  return (
    <>
      <header>
        <Navigation />
      </header>
      <main class="w-full h-full">{props.children}</main>
    </>
  )
}
