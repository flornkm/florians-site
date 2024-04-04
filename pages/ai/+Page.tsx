import * as m from "#lang/paraglide/messages"
import Waitlist from "#components/Waitlist"
import Button from "#components/Button"
import { useCallback, useState } from "preact/hooks"

const decoder = new TextDecoder()

export default function Page() {
  const [generatedText, setGeneratedText] = useState<string[]>([])
  const [error, setError] = useState<string>("")

  const sendToAI = useCallback(async () => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Hello, AI!" }),
      })

      const reader = response.body!.getReader()

      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const data = decoder.decode(value)
          console.log(data)
          setGeneratedText((prevState) => [...prevState, data])
        }
      }
    } catch (error) {
      setError("Error fetching data from server.")
      console.error("Error fetching data from server.", error)
    }
  }, [generatedText, setGeneratedText])

  return (
    <div class="w-full">
      <section class="w-full min-h-screen flex-col flex items-center justify-center">
        {generatedText.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
        {error && <p>{error}</p>}
        <Button type="primary" function={sendToAI}>
          Trigger AI
        </Button>
      </section>
    </div>
  )
}
