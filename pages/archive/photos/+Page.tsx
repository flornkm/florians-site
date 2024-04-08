import { FolderIllustration } from "#design-system/Vectors"
import FileSystem from "#sections/FileSystem"
import { useState } from "preact/hooks"

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
  const [photoPopup, setPhotoPopup] = useState<string | null>(null)

  function PhotoPopup({ src }: { src: string }) {
    return (
      <div
        className="fixed top-0 left-0 p-4 w-full h-full bg-black/25 z-[52] cursor-zoom-out"
        onClick={() => setPhotoPopup(null)}
      >
        <div className="w-full h-full rounded-lg relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img src={src} alt="photo" className="object-contain h-full w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <FileSystem>
        <div className="w-full gap-4 items-start grid xl:grid-cols-5 md:grid-cols-3 xs:grid-cols-2">
          <a
            href="/archive"
            className="p-4 transition-colors hover:bg-neutral-200 rounded-lg flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-2 w-28">
              <FolderIllustration />
              <p className="font-medium text-center">..</p>
            </div>
          </a>
          {photos.map((photo) => {
            return (
              <Item>
                <img
                  onClick={() => {
                    setPhotoPopup(photo.src)
                  }}
                  data-src={photo.src}
                  src={photo.src}
                  alt={photo.src.split("/").pop()?.split(".")[0]}
                  className="object-cover cursor-zoom-in h-32 w-full transition-opacity hover:opacity-75 border border-neutral-200"
                />
              </Item>
            )
          })}
        </div>
      </FileSystem>
      {photoPopup && <PhotoPopup src={photoPopup} />}
    </div>
  )
}

function Item(props: { children: any }) {
  return (
    <div className="w-full bg-neutral-100 dark:bg-neutral-900 relative">
      {props.children}
    </div>
  )
}
