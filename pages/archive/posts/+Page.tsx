import { InlineLink } from "#components/Button"
import { FolderIllustration } from "#design-system/Vectors"
import { userScrolledDown } from "#hooks/userScrolledDown"
import FileSystem from "#sections/FileSystem"
import { useState } from "preact/hooks"

type Post = {
  src: string
  type: "image" | "video"
}

export const posts = [
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
  {
    src: "/images/archive/posts/missingfont-web.webp",
    type: "image",
  },
  {
    src: "/images/archive/posts/missingfont-mobile.webp",
    type: "image",
  },
  {
    src: '<div style="padding: 56.25% 0 0 0; position: relative"><div style="height:100%;left:0;position:absolute;top:0;width:100%"><iframe height="100%" width="100%;" src="https://embed.wave.video/BxJWyuZLr0yAivNJ" frameborder="0" allow="autoplay; fullscreen" scrolling="no"></iframe></div></div>',
    type: "video",
  },
] as Post[]

posts.reverse()

export default function Page() {
  const [postPopup, setPostPopup] = useState<{
    type: "photo" | "video"
    src: string
  } | null>(null)

  function PostPopup({ src, type }: { src: string; type: "photo" | "video" }) {
    return (
      <div
        className="fixed top-0 left-0 p-4 w-full h-full bg-black/25 z-[52] cursor-zoom-out"
        onClick={() => setPostPopup(null)}
      >
        <div className="w-full max-w-4xl h-full rounded-lg relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {type === "video" ? (
            <div
              dangerouslySetInnerHTML={{ __html: src }}
              className="w-full h-auto absolute top-1/2 -translate-y-1/2 pointer-events-none"
            />
          ) : (
            <img
              src={src}
              alt="photo"
              className="object-contain h-full w-full"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <FileSystem items={{ amount: posts.length, label: "projects" }}>
        <div className="w-full gap-4 items-start grid xl:grid-cols-5 md:grid-cols-3 xs:grid-cols-2">
          <button
            onClick={(e) => {
              if (
                e.detail === 1 &&
                typeof window !== "undefined" &&
                window.innerWidth > 768
              )
                e.preventDefault()
              else window.location.href = "/archive"
            }}
            className="p-4 relative rounded-lg flex items-center justify-center group cursor-default active:scale-95 transition-transform duration-75"
          >
            <div className="flex flex-col items-center gap-2 w-28">
              <div class="text-neutral-400 relative dark:text-neutral-500">
                <FolderIllustration />
              </div>
              <p className="font-medium text-center text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors duration-75">
                ..
              </p>
            </div>
          </button>
          {posts.map((post) => {
            return (
              <Item>
                {post.type === "image" ? (
                  <img
                    onClick={() => {
                      setPostPopup({ type: "photo", src: post.src })
                    }}
                    data-src={post.src}
                    src={post.src}
                    alt={post.src.split("/").pop()?.split(".")[0]}
                    class="object-cover w-full cursor-zoom-in h-32 transition-opacity hover:opacity-75"
                  />
                ) : (
                  <div
                    onClick={() =>
                      setPostPopup({ type: "video", src: post.src })
                    }
                    class="transition-opacity hover:opacity-75 cursor-zoom-in h-32 relative overflow-hidden"
                  >
                    <div
                      class="pointer-events-none absolute inset-0 w-56 left-1/2 -translate-x-1/2 border border-neutral-200"
                      dangerouslySetInnerHTML={{ __html: post.src }}
                    />
                  </div>
                )}
              </Item>
            )
          })}
        </div>
      </FileSystem>
      {postPopup && <PostPopup src={postPopup.src} type={postPopup.type} />}
    </div>
  )
}

function Item(props: { children: any }) {
  return (
    <div class="w-full bg-neutral-100 dark:bg-neutral-900 relative border border-neutral-200 dark:border-neutral-800">
      {props.children}
    </div>
  )
}
