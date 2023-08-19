"use client"

import { useState, useEffect } from "react"

export function useIsVisible(ref: React.RefObject<HTMLDivElement>) {
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
