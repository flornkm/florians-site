import { useEffect } from "preact/hooks"

type ResizeCallback = () => void

export const useWindowResize = (callback: ResizeCallback) => {
  useEffect(() => {
    const handleResize = () => {
      callback()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [callback])
}
