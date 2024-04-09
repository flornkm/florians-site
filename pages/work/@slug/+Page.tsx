import "#design-system/markdown.css"
import Markdown from "#markdown/Markdown"
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
      <Markdown class="lg:py-4 pb-16" content={props.content} />
    </>
  )
}
