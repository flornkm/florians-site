import "#design-system/markdown.css"
import hljs from "highlight.js"
import { useEffect } from "preact/hooks"

export default function Page(props: Record<string, string>) {
  useEffect(() => {
    hljs.highlightAll()

    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches

    const syntaxHighlightingCSS = prefersDarkMode
      ? import("highlight.js/styles/github-dark.css")
      : import("highlight.js/styles/github.css")

    syntaxHighlightingCSS.then((module) => {
      module.default
    })
  })

  return (
    <>
      <article class="lg:py-16 pb-16">
        <div dangerouslySetInnerHTML={{ __html: props.content }}></div>
      </article>
    </>
  )
}
