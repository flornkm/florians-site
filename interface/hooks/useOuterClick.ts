import { useEffect, useRef } from "preact/hooks"

export default function useOuterClick(callback: (() => void) | undefined) {
  const callbackRef = useRef() as any
  const innerRef = useRef()

  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
    function handleClick(e: { target: any }) {
      if (
        innerRef.current &&
        callbackRef.current &&
        // @ts-ignore
        !innerRef.current.contains(e.target)
      )
        callbackRef.current(e)
    }
  }, [])

  return innerRef
}
