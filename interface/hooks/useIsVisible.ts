import { RefObject } from "preact"
import { useState, useEffect } from "preact/hooks"

export function useIsVisible(ref: RefObject<HTMLDivElement>) {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting)
    )

    observer.observe(ref.current as HTMLDivElement)
    return () => {
      observer.disconnect()
    }
  }, [ref])

  return isIntersecting
}
