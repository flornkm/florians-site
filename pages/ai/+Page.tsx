import Button from "#components/Button"
import { useCallback, useRef, useState } from "preact/hooks"
import { Send } from "#design-system/Icons"
import LoadingSpinner from "#components/LoadingSpinner"

const decoder = new TextDecoder()

export default function Page() {
  const chatInput = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [generatedText, setGeneratedText] = useState<string[]>([])
  const [error, setError] = useState<string>("")

  const sendToAI = useCallback(async () => {
    const input = chatInput.current!.value
    if (input === "") return

    setLoading(true)
    chatInput.current!.value = ""

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
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

    setLoading(false)
  }, [generatedText, setGeneratedText])

  return (
    <div class="w-full">
      <section class="w-full min-h-screen flex-col flex items-center justify-center">
        <div class="w-full max-w-lg mb-8">
          {generatedText.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
          {error && <p>{error}</p>}
        </div>
        <form
          class="w-full max-w-lg sticky top-[90vh] mb-28 shadow-lg rounded-full"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            ref={chatInput}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                sendToAI()
              }
            }}
            type="text"
            placeholder="Ask me anything!"
            class={
              "w-full placeholder:text-neutral-400 relative top-[1px] disabled:cursor-not-allowed outline-0 outline-neutral-500/0 transition-all focus:outline-4 focus:outline-neutral-500/10 outline-offset-1 px-6 py-3 rounded-full bg-white border dark:bg-neutral-800 dark:placeholder:text-neutral-500 dark:focus:outline-none " +
              +(loading ? " opacity-50 pointer-events-none" : "")
            }
          />
          <Button
            function={() => {
              sendToAI()
            }}
            rounded
            type="primary"
            class={
              "absolute right-1 top-1/2 -translate-y-1/2 group/button leading-none overflow-hidden md:hover:pl-28 mt-[1px] " +
              (loading ? "pointer-events-none" : "")
            }
          >
            <>
              <p class="absolute hidden md:block transition-all opacity-0 md:group-hover/button:block group-hover/button:opacity-100 -left-[100%] group-hover/button:left-4 duration-200">
                Send
              </p>
              {loading ? (
                <div class="p-2.5">
                  <LoadingSpinner invert class="w-6 h-6" thin />
                </div>
              ) : (
                <Send class="w-5 h-5 rotate-90" />
              )}
            </>
          </Button>
        </form>
      </section>
    </div>
  )
}
