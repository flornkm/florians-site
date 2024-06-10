import Button, { InlineLink } from "#components/Button"
import { Eye, Rotate, Trash } from "#design-system/Icons"
import { useState, useEffect } from "preact/hooks"

export default function Page() {
  useEffect(() => {
    const handle = document.getElementById("split-handle") as HTMLButtonElement
    const topPane = document.getElementById("split-top") as HTMLDivElement
    const bottomPane = document.getElementById("split-bottom") as HTMLDivElement
    const container = handle.parentNode?.parentNode as HTMLDivElement

    if (!handle || !topPane || !bottomPane || !container) return

    let isDragging = false
    let startY: number, startHeightTop: number, startHeightBottom: number
    let animationFrame: number | null = null

    const predefinedRatios = [2 / 7, 1 / 2, 5 / 7]

    const onDragStart = (y: number) => {
      isDragging = true
      startY = y
      startHeightTop = topPane.offsetHeight
      startHeightBottom = bottomPane.offsetHeight
      handle.classList.add("dragging")
    }

    const onDragMove = (y: number) => {
      if (!isDragging) return
      const dy = y - startY
      const newHeightTop = startHeightTop + dy
      const newHeightBottom = startHeightBottom - dy

      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
      }

      animationFrame = requestAnimationFrame(() => {
        topPane.style.height = `${newHeightTop}px`
        bottomPane.style.height = `${newHeightBottom}px`
      })
    }

    const snapToNearestRatio = () => {
      const containerHeight = container.offsetHeight
      const currentTopHeight = topPane.offsetHeight
      const currentRatio = currentTopHeight / containerHeight

      const nearestRatio = predefinedRatios.reduce((prev, curr) =>
        Math.abs(curr - currentRatio) < Math.abs(prev - currentRatio)
          ? curr
          : prev
      )

      const newHeightTop = containerHeight * nearestRatio
      const newHeightBottom = containerHeight - newHeightTop

      topPane.style.height = `${newHeightTop}px`
      bottomPane.style.height = `${newHeightBottom}px`

      document.getElementById("ratio")!.textContent = nearestRatio
        .toFixed(1)
        .toString()
    }

    const onDragEnd = () => {
      isDragging = false
      handle.classList.remove("dragging")
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
        animationFrame = null
      }
      snapToNearestRatio()
    }

    const onMouseDown = (e: MouseEvent) => {
      onDragStart(e.clientY)
    }

    const onMouseMove = (e: MouseEvent) => {
      onDragMove(e.clientY)
    }

    const onMouseUp = () => {
      onDragEnd()
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) return
      onDragStart(e.touches[0].clientY)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) return
      e.preventDefault() // Prevent scrolling
      onDragMove(e.touches[0].clientY)
    }

    const onTouchEnd = () => {
      onDragEnd()
    }

    handle.addEventListener("mousedown", onMouseDown)
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    handle.addEventListener("touchstart", onTouchStart)
    document.addEventListener("touchmove", onTouchMove, { passive: false })
    document.addEventListener("touchend", onTouchEnd)

    return () => {
      handle.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      handle.removeEventListener("touchstart", onTouchStart)
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  return (
    <>
      <div class="flex items-center mb-4 py-2 bg-transparent sticky top-0 lg:top-14 z-50">
        <div class="w-[99vw] bg-light-neutral/95 backdrop-blur-xl dark:bg-black/90 absolute top-0 bottom-0 left-1/2 -translate-x-1/2" />
        <div class="flex relative z-20">
          <InlineLink link="/archive" class="px-1.5 -ml-1.5">
            Archive
          </InlineLink>
          <p> / </p>
          <InlineLink link="/archive/experiments" class="px-1.5 line-clamp-1">
            Experiments
          </InlineLink>
          <p> / </p>
          <p class="font-medium px-1.5 text-neutral-400 dark:text-neutral-600 truncate">
            Splitview
          </p>
        </div>
      </div>
      <div class="w-full mx-auto max-w-xl h-[calc(100vh-256px)]">
        <div class="flex flex-col group bg-black dark:bg-neutral-950 rounded-2xl h-full border border-neutral-200 dark:border-neutral-800 overflow-hidden selection:bg-transparent selection:text-inherit">
          <div
            id="split-top"
            class="h-full bg-white dark:bg-neutral-900 rounded-b-2xl p-8 overflow-hidden group-active:transition-none transition-all ease-out"
          >
            <h1 class="text-xl mb-2 font-semibold text-neutral-900 dark:text-white truncate">
              This is an example of a split view.
            </h1>
            <p class="text-neutral-500 dark:text-neutral-400 mb-8">
              The current ratio of this pane is{" "}
              <span
                id="ratio"
                class="font-bold font-mono text-black bg-neutral-100 dark:text-white dark:bg-neutral-800 rounded-sm"
              >
                0.5
              </span>{" "}
              of the full screen height.
            </p>
            <p class="text-neutral-500 dark:text-neutral-400 mb-8">
              You'll be able to drag the handle in the middle to resize the
              panes. <br />
              The content on the panes will disappear when you start dragging
              the other pane over it.
            </p>
            <p class="text-neutral-500 dark:text-neutral-400">
              Dragging is easier due to preset ratios.
            </p>
          </div>
          <div
            id="split-handle"
            class="h-5 flex-shrink-0 flex items-center px-8 active:cursor-grabbing relative truncate"
          >
            <button class="md:w-24 w-12 group-active:w-10 mx-auto md:group-active:w-20 rounded-full active:cursor-grabbing cursor-grab bg-white h-1 transition-all duration-300"></button>
          </div>
          <div
            id="split-bottom"
            class="h-full bg-white dark:bg-neutral-900 rounded-t-2xl p-2 overflow-hidden group-active:transition-none transition-all ease-out"
          >
            <div class="w-full h-full max-h-[484px] mx-auto mb-4 rounded-xl bg-cover bg-[url(/images/examples/apple.webp)]" />
          </div>
        </div>
      </div>
    </>
  )
}
