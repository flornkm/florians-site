import { InlineLink } from "#components/Button"
import { userScrolledDown } from "#hooks/userScrolledDown"

type Post = {
  src: string
  type: "image" | "video"
}

const posts = [
  {
    src: "/images/archive/posts/domainlist.webp",
    type: "image",
  },
  {
    src: "/images/archive/posts/image-recognizer.webp",
    type: "image",
  },
  {
    src: "/images/archive/posts/inlang-timeline.webp",
    type: "image",
  },
  {
    src: "/images/archive/posts/memoji-laptop.webp",
    type: "image",
  },
  {
    src: '<div style="padding: 62.50% 0 0 0; position: relative"><div style="height:100%;left:0;position:absolute;top:0;width:100%"><iframe height="100%" width="100%;" src="https://embed.wave.video/0p1fbsjamDWXd9cG" frameborder="0" allow="autoplay; fullscreen" scrolling="no"></iframe></div></div>',
    type: "video",
  },
  {
    src: "/images/archive/posts/more-is-less.webp",
    type: "image",
  },
  {
    src: "/images/archive/posts/rabbit-icons.webp",
    type: "image",
  },
  {
    src: "/images/archive/posts/smart-mirror.webp",
    type: "image",
  },
  {
    src: "/images/archive/posts/transportation.webp",
    type: "image",
  },
  {
    src: '<div style="padding: 62.50% 0 0 0; position: relative"><div style="height:100%;left:0;position:absolute;top:0;width:100%"><iframe height="100%" width="100%;" src="https://embed.wave.video/nqAGm3gE4caLM6xP" frameborder="0" allow="autoplay; fullscreen" scrolling="no"></iframe></div></div>',
    type: "video",
  },
] as Post[]

posts.reverse()

export default function Page() {
  return (
    <div class="w-full">
      <section class="w-full pb-24">
        <div
          class={
            "flex items-center lg:mt-6 mb-6  bg-light-zinc/95 backdrop-blur-xl dark:bg-black/90 sticky top-0 lg:top-14 z-50 transition-all " +
            (userScrolledDown(40)
              ? "font-medium py-2"
              : "text-3xl font-semibold lg:py-2")
          }
        >
          <InlineLink link="/archive" class="px-1.5 -ml-1.5" hideWeight>
            Archive
          </InlineLink>
          <p> / </p>
          <p class="px-1.5 text-zinc-400 dark:text-zinc-600 truncate">Posts</p>
        </div>
        <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 w-full gap-4 h-full min-h-screen">
          <div class="py-0.5 gap-4 flex items-start flex-col h-full">
            {posts
              .filter((_, i) => i % 3 === 0)
              .map((post) => {
                return (
                  <Item>
                    {post.type === "image" ? (
                      <img
                        src={post.src}
                        alt={post.src.split("/").pop()?.split(".")[0]}
                        class="mx-auto"
                      />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: post.src }} />
                    )}
                  </Item>
                )
              })}
          </div>
          <div class="py-0.5 gap-4 flex items-start flex-col">
            {posts
              .filter((_, i) => i % 3 === 1)
              .map((post) => {
                return (
                  <Item>
                    {post.type === "image" ? (
                      <img
                        src={post.src}
                        alt={post.src.split("/").pop()?.split(".")[0]}
                        class="mx-auto"
                      />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: post.src }} />
                    )}
                  </Item>
                )
              })}
          </div>
          <div class="py-0.5 gap-4 flex items-start flex-col">
            {posts
              .filter((_, i) => i % 3 === 2)
              .map((post) => {
                return (
                  <Item>
                    {post.type === "image" ? (
                      <img
                        src={post.src}
                        alt={post.src.split("/").pop()?.split(".")[0]}
                        class="mx-auto"
                      />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: post.src }} />
                    )}
                  </Item>
                )
              })}
          </div>
        </div>
      </section>
    </div>
  )
}

function Item(props: { children: any }) {
  return (
    <div class="w-full bg-zinc-100 dark:bg-zinc-900 relative">
      {" "}
      {props.children}
    </div>
  )
}
