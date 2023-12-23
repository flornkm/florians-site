import { useState, useEffect } from "preact/hooks"

export function userScrolledDown(amount: number) {
  const [isScrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > amount)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return isScrolled
}
