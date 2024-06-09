import { useState, useEffect, useRef } from "preact/hooks"
import { InlineLink } from "#components/Button"
import "#design-system/experiments.css"

export default function Page() {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const caretRef = useRef<HTMLDivElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const input = inputRef.current
    const caret = caretRef.current
    const mirror = mirrorRef.current

    if (!input || !caret || !mirror) return

    const updateCaretPosition = () => {
      const selectionStart = input.selectionStart || 0
      const text = input.value.substring(0, selectionStart)

      mirror.textContent = text + "\u200b"

      const inputStyles = window.getComputedStyle(input)
      mirror.style.font = inputStyles.font
      mirror.style.padding = inputStyles.padding
      mirror.style.border = inputStyles.border
      mirror.style.boxSizing = inputStyles.boxSizing
      mirror.style.width = `${input.clientWidth}px`

      const range = document.createRange()
      const textNode = mirror.firstChild
      if (textNode) {
        range.setStart(textNode, text.length)
        range.setEnd(textNode, text.length)
      }
      const rects = range.getClientRects()
      const rect = rects[rects.length - 1]

      if (rect) {
        caret.style.left = `${
          rect.left - mirror.getBoundingClientRect().left
        }px`
        caret.style.top = `${rect.top - mirror.getBoundingClientRect().top}px`
      } else {
        caret.style.left = `12px`
        caret.style.top = `12px`
      }
    }

    const handleInput = () => {
      let inputValue = input.value
      let lines = inputValue.split("\n")

      if (lines.length > 4) {
        lines = lines.slice(0, 4)
      }

      lines = lines.map((line) =>
        line.length > 58 ? line.substring(0, 58) : line
      )

      input.value = lines.join("\n")

      updateCaretPosition()
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" ||
        event.key === "Backspace" ||
        event.key === "Delete"
      ) {
        requestAnimationFrame(updateCaretPosition)
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (focused) return

      const rect = input.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      caret.style.left = `${x}px`
      caret.style.top = `${y}px`
    }

    input.addEventListener("input", handleInput)
    input.addEventListener("click", handleInput)
    input.addEventListener("keyup", handleInput)
    input.addEventListener("keydown", handleKeydown)
    input.addEventListener("mousemove", handleMouseMove)

    return () => {
      input.removeEventListener("input", handleInput)
      input.removeEventListener("click", handleInput)
      input.removeEventListener("keyup", handleInput)
      input.removeEventListener("keydown", handleKeydown)
      input.removeEventListener("mousemove", handleMouseMove)
    }
  }, [focused])

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
            Custom Caret
          </p>
        </div>
      </div>
      <div class="w-full h-[calc(100vh-256px)] flex items-center justify-center">
        <div class="w-full max-w-lg h-full max-md:max-h-96 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-2xl shadow-black/[2%] rounded-xl border border-neutral-200 p-4">
          <h1 class="text-xl ml-3.5 font-semibold text-neutral-900 dark:text-white mb-4">
            Noteblock
          </h1>
          <div style={{ position: "relative" }} class="h-[calc(100%-44px)]">
            <textarea
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              class="w-full resize-none focus:border-blue-400 h-full focus:outline-none caret-transparent border border-neutral-200 bg-transparent dark:border-neutral-800 dark:focus:border-blue-400/40 rounded-lg px-4 py-2"
              ref={inputRef}
              rows={4}
              style={{ overflow: "hidden", cursor: "none" }}
            />
            <div
              ref={caretRef}
              class={
                "custom-caret " +
                (focused ? " transition-all duration-100 ease-in-out" : "")
              }
              style={{ position: "absolute", top: "12px", left: "12px" }}
            />
            <div
              ref={mirrorRef}
              class="mirror-div"
              style={{
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "pre-wrap",
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
