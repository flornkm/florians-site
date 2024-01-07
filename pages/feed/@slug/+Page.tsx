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
    <div class="lg:mt-16 max-w-lg mx-auto">
      <div class="flex justify-between items-center gap-4 flex-wrap mb-2">
        <div class="flex items-center gap-1 mb-2 text-zinc-400 dark:text-zinc-500 text-sm flex-wrap">
          {props.post.type === "writing" ? (
            <div class="text-sm flex items-center gap-1.5">
              <Writing class="inline-block" stroke={1.5} />
              Writing
            </div>
          ) : props.post.type === "sports" ? (
            <div class="text-sm flex items-center gap-1.5">
              <Sports class="inline-block" stroke={1.5} />
              Sports Entry
            </div>
          ) : (
            <></>
          )}
          <p>•</p>
          <p>
            {date.toLocaleDateString("en-US", { weekday: "long" })} –{" "}
            {date.toLocaleDateString("en-US", {
              month: "long",
            })}{" "}
            {date.getDate()}, {date.getFullYear()}
          </p>{" "}
        </div>
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
        </Picker>{" "}
      </div>
      {/* <h1 class="text-4xl font-bold mb-8">{props.title}</h1> */}
      <div class="flex items-center gap-1 mb-2 text-zinc-400 dark:text-zinc-500 text-sm flex-wrap">
        {props.post.type === "sports" && (
          <div class="w-full bg-zinc-100 px-4 py-8 dark:bg-zinc-900 my-4">
            <div class="relative w-full grid xs:grid-cols-3 place-items-end gap-4 text-zinc-500 dark:text-zinc-400">
              <div class="mx-auto">
                <div
                  style={{
                    height: "128px",
                  }}
                  class="w-10 h-full relative rounded-xl bg-zinc-200 mb-4 dark:bg-zinc-800"
                >
                  <div
                    style={{
                      height: props.post.move / 3 + "px",
                    }}
                    class="w-full rounded-xl absolute bottom-0 left-0 right-0 bg-rose-500"
                  />
                  <p class="absolute bottom-1 z-10 font-medium text-white text-sm left-1/2 -translate-x-1/2 font-rounded dark:text-zinc-900">
                    {props.post.move}
                  </p>
                </div>
                <p class="text-xs text-center mt-2 font-mono">Move</p>
              </div>
              <div class="mx-auto">
                <div
                  style={{
                    height: "128px",
                  }}
                  class="w-10 h-full relative rounded-xl bg-zinc-200 mx-auto mb-4 dark:bg-zinc-800"
                >
                  <div
                    style={{
                      height: props.post.exercise * 0.6 + "px",
                    }}
                    class="w-full rounded-xl absolute bottom-0 left-0 right-0 bg-green-500"
                  />
                  <p class="absolute bottom-1 z-10 font-medium text-white text-sm left-1/2 -translate-x-1/2 font-rounded dark:text-zinc-900">
                    {props.post.exercise}
                  </p>
                </div>
                <p class="text-xs text-center mt-2 font-mono">Exercise</p>
              </div>
              <div class="mx-auto">
                <div
                  style={{
                    height: "128px",
                  }}
                  class="w-10 h-full relative rounded-xl bg-zinc-200 mx-auto mb-4 dark:bg-zinc-800"
                >
                  <div
                    style={{
                      height: props.post.stand / 2 + "px",
                    }}
                    class="w-full rounded-xl absolute bottom-0 left-0 right-0 bg-sky-500"
                  />
                  <p class="absolute bottom-1 z-10 font-medium text-white text-sm left-1/2 -translate-x-1/2 font-rounded dark:text-zinc-900">
                    {props.post.stand}
                  </p>
                </div>
                <p class="text-xs text-center mt-2 font-mono">Stand</p>
              </div>
            </div>
          </div>
        )}
        <Markdown class="post" content={props.content} />
      </div>
    </div>
  )
}
