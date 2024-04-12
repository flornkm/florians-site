import Picker from "#components/Picker"
import "#design-system/feed.css"
import Markdown from "#markdown/Markdown"
import { useState } from "preact/hooks"
import { Edit as Writing, Sports } from "#design-system/Icons"
import { Share } from "#design-system/Icons"

export default function Page(
  props: Record<string, string> & { content: string; post: any }
) {
  const [copyLabel, setCopyLabel] = useState("Copy link")
  const date = new Date(
    Number(props.post.date.split("/")[2]),
    Number(props.post.date.split("/")[1]) - 1,
    Number(props.post.date.split("/")[0])
  )

  return (
    <>
      <div class="mb-24 flex flex-col lg:flex-row w-full">
        <div class="lg:max-w-[calc((100%-432px)/2)] lg:w-full items-center gap-1 text-neutral-400 dark:text-neutral-500 text-sm mb-2 md:0 pr-8">
          <p>
            {date.toLocaleDateString("en-US", { weekday: "long" })} –{" "}
            {date.toLocaleDateString("en-US", {
              month: "long",
            })}{" "}
            {date.getDate()}, {date.getFullYear()}
          </p>
        </div>
        <div class="lg:max-w-nav w-full lg:mx-auto">
          <div class="relative">
            <Markdown class="post mb-4" content={props.content} />
          </div>
        </div>
        <div class="lg:max-w-[calc((100%-432px)/2)] lg:w-full lg:order-last order-first lg:ml-0 ml-auto lg:pl-4 relative lg:bottom-0 -bottom-6">
          <div class="flex">
            <Picker
              options={[
                {
                  label: copyLabel,
                  function: () => {
                    navigator.clipboard.writeText(
                      "https://floriankiem.com" + props.post.url
                    )
                    setCopyLabel("Copied!")
                    setTimeout(() => {
                      setCopyLabel("Copy link")
                    }, 1000)
                  },
                },
                {
                  label: "Share on X",
                  link: `https://x.com/intent/tweet?text=${props.post.title} from Florian&url=https://floriankiem.com${props.post.url}`,
                },
              ]}
              position="bottom"
              align="right"
            >
              <Share size={24} />
            </Picker>
          </div>
        </div>
      </div>
    </>
  )
}
