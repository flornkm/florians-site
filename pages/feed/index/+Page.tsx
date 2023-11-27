import "#design-system/feed.css"
import { Post, PostContent } from "../types"
import * as m from "#lang/paraglide/messages"
import Share from "~icons/eva/share-outline"
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
  return (
    <div class="w-full">
      <section class="w-full lg:pt-16">
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
                <div class="flex items-center justify-between">
                  <p class="text-sm text-zinc-400">
                    {date.toLocaleDateString("en-US", { weekday: "long" })} –{" "}
                    {date.toLocaleDateString("en-US", {
                      month: "long",
                    })}{" "}
                    {date.getDate()}, {date.getFullYear()}
                  </p>
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
                    position="top"
                    align="right"
                  >
                    <Share />
                  </Picker>
                </div>
                <Markdown content={content[post.slug]} />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
