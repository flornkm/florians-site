"use client"

import { useEffect } from "react"

export default function Error({ error }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <p>Something went wrong… please try again!</p>
    </div>
  )
}
