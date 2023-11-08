import "#design-system/feed.css"
import { Post, PostContent } from "../types"
import * as m from "@inlang/paraglide-js/florians-site/messages"

export default function Page({
  posts,
  content,
}: {
  posts: Post[]
  content: PostContent
}) {
  return (
    <div class="w-full">
      <section class="w-full lg:pt-16">
        <h1 class="text-3xl font-semibold mb-4">Feed</h1>
        <p class="text-zinc-500 mb-16 max-w-lg dark:text-zinc-400">
          This is my personal feed. A place for collecting my memories, writings
          and showcasing stuff.
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
              <div class="mb-24">
                <p class="text-sm text-zinc-400 mb-2">
                  {date.toLocaleDateString("en-US", { weekday: "long" })} –{" "}
                  {date.toLocaleDateString("en-US", {
                    month: "long",
                  })}{" "}
                  {date.getDate()}, {date.getFullYear()}
                </p>
                <article>
                  <div
                    dangerouslySetInnerHTML={{ __html: content[post.slug] }}
                  />
                </article>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
