import { Ref, useRef, useState } from "preact/hooks"
import { JSX } from "preact/jsx-runtime"
import { Close } from "#design-system/Icons"

interface PopupProps {
  isOpen: boolean
  onClose: () => void
  children: JSX.Element
  popup: Ref<HTMLDivElement>
}

export function Popup({ popup, isOpen, onClose, children }: PopupProps) {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      onClose()
      window.removeEventListener("keydown", () => {})
    }
  })

  return (
    <div
      class={`fixed inset-0 bg-black/25 z-[52] flex justify-center items-center ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } transition-opacity`}
      onClick={onClose}
    >
      <div class="w-full md:h-3/5 h-4/6 max-w-6xl md:px-10 px-6">
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          style={{
            transform: "scale(0.95)",
            opacity: 0,
          }}
          ref={popup}
          class="w-full h-full bg-white rounded-3xl relative flex justify-between md:flex-row flex-col transition-all dark:bg-neutral-900"
        >
          <Close
            onClick={onClose}
            class="absolute z-10 top-4 border right-4 w-9 h-9 p-1.5 text-black bg-neutral-50 hover:bg-white hover:text-neutral-800 border-neutral-200 transition-colors rounded-full cursor-pointer shadow-xl dark:text-black dark:bg-white dark:hover:bg-neutral-200 dark:border-neutral-200 dark:hover:border-neutral-400"
          />
          <div class="w-full h-full p-5 flex flex-col justify-between gap-4 overflow-y-scroll custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function usePopup() {
  const popup = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openPopup = () => {
    if (popup.current) {
      setIsOpen(true)
      popup.current.style.opacity = "1"
      popup.current.style.transform = "scale(1)"
      document.body.style.overflow = "hidden"
    }
  }

  const closePopup = () => {
    if (popup.current) {
      popup.current.style.opacity = "0"
      popup.current.style.transform = "scale(0.95)"
      setTimeout(() => {
        setIsOpen(false)
        document.body.style.overflow = "auto"
      }, 150)
    }
  }

  return { isOpen, openPopup, closePopup, popup }
}
