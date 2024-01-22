import { InlineLink } from "#components/Button"
import { userScrolledDown } from "#hooks/userScrolledDown"

const photos = [
  {
    src: "/images/archive/photos/IMG_6790.webp",
  },
  {
    src: "/images/archive/photos/IMG_7283.webp",
  },
  {
    src: "/images/archive/photos/IMG_7352.webp",
  },
  {
    src: "/images/archive/photos/IMG_7413.webp",
  },
  {
    src: "/images/archive/photos/IMG_7433.webp",
  },
  {
    src: "/images/archive/photos/IMG_7472.webp",
  },
  {
    src: "/images/archive/photos/IMG_8001.webp",
  },
  {
    src: "/images/archive/photos/IMG_5541.webp",
  },
  {
    src: "/images/archive/photos/IMG_8004.webp",
  },
  {
    src: "/images/archive/photos/IMG_8120.webp",
  },
]

photos.reverse()

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
          <p class="px-1.5 text-zinc-400 dark:text-zinc-600 truncate">Photos</p>
        </div>
        <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 w-full gap-4 h-full min-h-screen">
          <div class="py-0.5 gap-4 flex items-start flex-col h-full">
            {photos
              .filter((_, i) => i % 3 === 0)
              .map((photo) => {
                return (
                  <Item>
                    <img
                      src={photo.src}
                      alt={photo.src.split("/").pop()?.split(".")[0]}
                      class="mx-auto"
                    />
                  </Item>
                )
              })}
          </div>
          <div class="py-0.5 gap-4 flex items-start flex-col">
            {photos
              .filter((_, i) => i % 3 === 1)
              .map((photo) => {
                return (
                  <Item>
                    <img
                      src={photo.src}
                      alt={photo.src.split("/").pop()?.split(".")[0]}
                      class="mx-auto"
                    />
                  </Item>
                )
              })}
          </div>
          <div class="py-0.5 gap-4 flex items-start flex-col">
            {photos
              .filter((_, i) => i % 3 === 2)
              .map((photo) => {
                return (
                  <Item>
                    <img
                      src={photo.src}
                      alt={photo.src.split("/").pop()?.split(".")[0]}
                      class="mx-auto"
                    />
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
