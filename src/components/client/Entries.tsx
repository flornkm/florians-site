"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Transition } from "@headlessui/react"

export default function Entries({
  entries,
}: {
  entries: Record<string, any>[]
}) {
  const [hoveredImg, setHoveredImg] = useState(null)
  const [imgShow, setImgShow] = useState(false)
  const outerSticky = useRef(null)
  const reference = useRef(null)

  // make the height of the outerSticky as high as the reference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const outerStickyElement = outerSticky.current as HTMLElement | null
      const referenceElement = reference.current as HTMLElement | null

      if (outerStickyElement && referenceElement) {
        outerStickyElement.style.height =
          referenceElement.offsetHeight - 400 + "px"
      }
    }
  }, [])

  return (
    <>
      <div className="flex gap-4 justify-between max-md:flex-col pt-8 h-full min-h-screen relative">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 pb-16 md:pr-12">
          <h1 className="text-3xl font-semibold text-left mb-3">Blog</h1>
          <h2 className="text-xl text-left text-zinc-500 dark:text-zinc-400">
            Here you can find my thoughts, ideas and more I want to share with
            the world wide web.
          </h2>
          <div className="relative mt-12 max-md:hidden" ref={outerSticky}>
            <Transition
              show={imgShow}
              enter="transition-opacity duration-75"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              as="div"
              className="w-full sticky top-56"
            >
              <Image
                alt="Preview Image"
                priority
                src={hoveredImg || "/images/bridge/bridge.webp"}
                width={800}
                height={500}
              />
            </Transition>
          </div>
        </div>
        <div
          className="flex flex-col items-start gap-8 md:pt-32 md:pl-12 pb-24 md:min-w-[450px]"
          ref={reference}
        >
          {entries.map((entry, idx) => (
            <Link
              key={entries.indexOf(entry)}
              href={{ pathname: `/blog/${entry.slug}` }}
              onMouseOver={() => {
                setImgShow(true)
                setHoveredImg(entry.image)
              }}
              onMouseLeave={() => {
                setImgShow(false)
              }}
              className="cursor-pointer w-full flex flex-col justify-start transition-all hover:bg-zinc-100 px-4 py-3 rounded-lg text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 relative -left-4"
            >
              <h3 className="text-lg font-medium md:line-clamp-1 text-ellipsis transition-all text-black dark:text-white mb-2">
                {entry.title}
              </h3>
              <p className="text-ellipsis transition-all text-zinc-500 dark:text-zinc-400 font-mono text-sm">
                {entry.date}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
