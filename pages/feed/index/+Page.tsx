import "#design-system/feed.css"
import { Post, PostContent } from "../types"
import * as m from "#lang/paraglide/messages"
import { Share } from "#design-system/Icons"
import { Edit as Writing, Sports } from "#design-system/Icons"
import Picker from "#components/Picker"
import { useState } from "preact/hooks"
import Markdown from "#markdown/Markdown"

export default function Page({
  posts,
  content,
}: {
  posts: Post[]
  content: PostContent
}) {
  const [copyLabel, setCopyLabel] = useState("Copy link")
  posts.sort((a, b) => {
    const aDate = new Date(
      Number(a.date.split("/")[2]),
      Number(a.date.split("/")[1]) - 1,
      Number(a.date.split("/")[0])
    )
    const bDate = new Date(
      Number(b.date.split("/")[2]),
      Number(b.date.split("/")[1]) - 1,
      Number(b.date.split("/")[0])
    )
    return bDate.getTime() - aDate.getTime()
  })
  return (
    <div class="w-full">
      <section class="w-full lg:pt-8">
        <h1 class="text-3xl font-semibold mb-4">{m.feed_title()}</h1>
        <p class="text-zinc-500 mb-16 max-w-lg dark:text-zinc-400">
          {m.feed_description()}
        </p>
        <div class="w-full h-[1px] bg-zinc-100 my-16 dark:bg-zinc-900" />
        <div class="py-0.5 pb-16 max-w-lg mx-auto">
          {posts.map((post: any) => {
            const date = new Date(
              Number(post.date.split("/")[2]),
              Number(post.date.split("/")[1]) - 1,
              Number(post.date.split("/")[0])
            )
            return (
              <div
                class={
                  posts.indexOf(post) === posts.length - 1
                    ? ""
                    : "mb-24 md:mb-48"
                }
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-1 mb-2 text-zinc-400 dark:text-zinc-500 text-sm flex-wrap">
                    {post.type === "writing" ? (
                      <div class="text-sm flex items-center gap-1.5">
                        <Writing class="inline-block" stroke={1.5} />
                        Writing
                      </div>
                    ) : post.type === "sports" ? (
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
                    </p>
                  </div>
                  <Picker
                    options={[
                      {
                        label: copyLabel,
                        function: () => {
                          navigator.clipboard.writeText(
                            "https://floriankiem.com" + post.url
                          )
                          setCopyLabel("Copied!")
                          setTimeout(() => {
                            setCopyLabel("Copy link")
                          }, 1000)
                        },
                      },
                      {
                        label: "Share on X",
                        link: `https://x.com/intent/tweet?text=${post.title} from Florian&url=https://floriankiem.com${post.url}`,
                      },
                    ]}
                    position="bottom"
                    align="right"
                  >
                    <Share size={24} />
                  </Picker>
                </div>
                {post.type === "sports" && (
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
                              height: post.move / 3 + "px",
                            }}
                            class="w-full rounded-xl absolute bottom-0 left-0 right-0 bg-rose-500"
                          />
                          <p class="absolute bottom-1 z-10 font-medium text-white text-sm left-1/2 -translate-x-1/2 font-rounded dark:text-zinc-900">
                            {post.move}
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
                              height: post.exercise * 0.6 + "px",
                            }}
                            class="w-full rounded-xl absolute bottom-0 left-0 right-0 bg-green-500"
                          />
                          <p class="absolute bottom-1 z-10 font-medium text-white text-sm left-1/2 -translate-x-1/2 font-rounded dark:text-zinc-900">
                            {post.exercise}
                          </p>
                        </div>
                        <p class="text-xs text-center mt-2 font-mono">
                          Exercise
                        </p>
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
                              height: post.stand / 2 + "px",
                            }}
                            class="w-full rounded-xl absolute bottom-0 left-0 right-0 bg-sky-500"
                          />
                          <p class="absolute bottom-1 z-10 font-medium text-white text-sm left-1/2 -translate-x-1/2 font-rounded dark:text-zinc-900">
                            {post.stand}
                          </p>
                        </div>
                        <p class="text-xs text-center mt-2 font-mono">Stand</p>
                      </div>
                    </div>
                  </div>
                )}
                <Markdown class="post" content={content[post.slug]} />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
