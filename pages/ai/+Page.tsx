import Letters from "#sections/Letters"
import Work from "#sections/Work"
import * as m from "#lang/paraglide/messages"
import Waitlist from "#components/Waitlist"
import Button from "#components/Button"
import { useCallback, useEffect, useState } from "preact/hooks"

const decoder = new TextDecoder()

export default function Page({ projects }: { projects: any[] }) {
  const [generatedText, setGeneratedText] = useState<string[]>([])

  const [completion, setCompletion] = useState<string | null>(null)

  useEffect(() => {
    // if (completion) {
    //   setData((prev) => ({ ...prev, key: completion }));
    // }
  }, [completion])

  const sendToAI = async () => {
    const response = await fetch("/api/ai")
    const reader = response.body!.getReader()

    let done = false

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const data = decoder.decode(value)
      console.log(data)
      setGeneratedText((prev) => [...prev, data])
    }
  }

  return (
    <div class="w-full">
      <section class="w-full min-h-screen flex items-center justify-center">
        <Button type="primary" function={sendToAI}>
          Trigger AI
        </Button>
      </section>
    </div>
  )
}
