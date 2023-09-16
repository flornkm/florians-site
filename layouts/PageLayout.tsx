import { JSX } from "preact/jsx-runtime"
import "../design-system/global.css"

export default function PageLayout(props: { children: JSX.Element }) {
  return (
    <>
      <header>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
      </header>
      <main class="bg-red-500">{props.children}</main>
    </>
  )
}
