import { Ref, useRef, useState } from "preact/hooks"
import { JSX } from "preact/jsx-runtime"
import { Close } from "#design-system/Icons"
import Button from "./Button"

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

  const isMobile = window.innerWidth < 768

  return (
    <div
      class={`fixed inset-0 bg-black/25 z-[52] flex md:justify-center justify-center md:items-center items-end ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } transition-opacity`}
      onClick={onClose}
    >
      <div class="w-full md:h-3/5 h-4/6 max-w-6xl md:px-10 flex items-end">
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          onTouchStart={(e) => {
            const startY = e.touches[0].clientY
            const onMove = (e: TouchEvent) => {
              if (popup.current) {
                popup.current.style.transition = "none"
              }

              const close =
                Math.abs(e.touches[0].clientY - startY) > 250 &&
                e.touches[0].clientY - startY > 0

              if (close) {
                popup.current!.style.transition =
                  "all cubic-bezier(0.4, 0, 0.2, 1) 0.15s"
                onClose()
                window.removeEventListener("touchmove", onMove)
              }

              if (popup.current) {
                const diffY = e.touches[0].clientY - startY
                if (diffY > 0 && !close)
                  popup.current.style.height = `calc(100% - ${diffY}px)`
                else if (close)
                  e.preventDefault(),
                    setTimeout(
                      () => (popup.current!.style.height = "100%"),
                      150
                    )
              }
            }
            window.addEventListener("touchmove", onMove)
          }}
          style={{
            transform: isMobile ? "translateY(32px)" : "scale(0.95)",
            opacity: 0,
          }}
          ref={popup}
          class="w-full h-full bg-white rounded-t-3xl md:rounded-3xl relative flex justify-between md:flex-row flex-col transition-all dark:bg-neutral-900"
        >
          <div class="md:hidden absolute left-1/2 -translate-x-1/2 top-3 h-1.5 w-20 bg-neutral-200 rounded-full" />
          <Button
            type="secondary"
            function={onClose}
            rounded
            class="absolute top-4 right-5 w-10 h-10 flex items-center justify-center"
          >
            <Close class="w-6 h-6 flex-shrink-0" />
          </Button>
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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  const openPopup = () => {
    if (popup.current) {
      setIsOpen(true)
      popup.current.style.opacity = "1"
      popup.current.style.transform = isMobile ? "translateY(0)" : "scale(1)"
      document.body.style.overflow = "hidden"
    }
  }

  const closePopup = () => {
    if (popup.current) {
      popup.current.style.opacity = "0"
      popup.current.style.transform = isMobile
        ? "translateY(32px)"
        : "scale(0.95)"
      setTimeout(() => {
        setIsOpen(false)
        document.body.style.overflow = "auto"
      }, 150)
    }
  }

  return { isOpen, openPopup, closePopup, popup }
}
