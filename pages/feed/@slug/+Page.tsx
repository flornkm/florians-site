import Picker from "#components/Picker"
import "#design-system/feed.css"
import Markdown from "#markdown/Markdown"
import { useState } from "preact/hooks"
import { Share } from "#design-system/Icons"

export default function Page(props: Record<string, string>) {
  const [copyLabel, setCopyLabel] = useState("Copy link")
  return (
    <>
      <div>
        <Markdown
          class="lg:mt-16 max-w-lg mx-auto post"
          content={props.content}
        />
      </div>
      <div class="flex items-center justify-end mb-16 mx-auto max-w-lg">
        <Picker
          options={[
            {
              label: copyLabel,
              function: () => {
                // copy to clipboard the current page's url
                navigator.clipboard.writeText(
                  typeof window !== "undefined"
                    ? window.location.href.replace(/\/$/, "")
                    : ""
                )
                setCopyLabel("Copied!")
                setTimeout(() => {
                  setCopyLabel("Copy link")
                }, 1000)
              },
            },
          ]}
          position="top"
          align="right"
        >
          <Share />
        </Picker>
      </div>
    </>
  )
}
