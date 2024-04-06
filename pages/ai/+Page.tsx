import Button from "#components/Button"
import { useCallback, useEffect, useRef, useState } from "preact/hooks"
import { Send } from "#design-system/Icons"
import LoadingSpinner from "#components/LoadingSpinner"

const decoder = new TextDecoder()

export default function Page() {
  const chatInput = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  )
  const [generatedText, setGeneratedText] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [hideIntro, setHideIntro] = useState<boolean>(false)
  const chatWrapper = useRef<HTMLDivElement>(null)

  const sendToAI = useCallback(async () => {
    const input = chatInput.current!.value
    if (input === "") return

    setLoading(true)

    chatInput.current!.value = ""
    setMessages([...messages, { role: "user", content: input }])

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              role: "user",
              content: input,
            },
          ],
        }),
      })

      const reader = response.body!.getReader()

      let done = false
      let text = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const data = decoder.decode(value)
          setGeneratedText((prev) => [...prev, data])
          text += data

          if (chatWrapper.current)
            window.scrollTo({
              top: chatWrapper.current.scrollHeight - window.innerHeight,
              behavior: "smooth",
            })
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: text,
        },
      ])
    } catch (error) {
      setError("Error fetching data from server.")
      console.error("Error fetching data from server.", error)
    }

    setGeneratedText([])

    setLoading(false)
  }, [messages, setMessages, setGeneratedText])

  const Introduction = () => {
    useEffect(() => {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "auto"
      }
    }, [hideIntro])

    return (
      <div class="w-screen h-screen flex items-center justify-center fixed inset-0 bg-white z-50">
        <div class="flex flex-col items-center max-w-md">
          <div class="aspect-square w-24 rounded-full bg-neutral-200 mb-8"></div>
          <h1 class="text-2xl font-bold mb-2 text-center">
            Talk to my AI clone
          </h1>
          <p class="text-center mb-8 text-neutral-500">
            This AI is a clone of me, especially useful for employees who want
            to ask me questions when I'm not around.
          </p>
          <Button function={() => setHideIntro(true)} type="primary">
            Get Started
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div class="w-full">
      {hideIntro ? null : <Introduction />}
      <section class="w-full min-h-screen flex-col">
        <form
          class="w-full lg:max-w-xl mx-auto sticky lg:top-[90vh] top-[82vh] md:mb-16 shadow-lg rounded-full mb-4 lg:mb-8"
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
        <div class="w-full mb-8 md:-mt-24 md:pb-72 pb-24" ref={chatWrapper}>
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}
          {loading && (
            <ChatBubble
              key={messages.length}
              role="system"
              content={generatedText.map((text) => text).join("")}
            />
          )}
          {error && <p>{error}</p>}
        </div>
      </section>
    </div>
  )
}

const ChatBubble = ({ role, content }: { role: string; content: string }) => {
  return (
    <div
      class={
        "flex items-center space-x-4 mb-4 " +
        (role === "user" ? "justify-end" : "justify-start")
      }
    >
      <div
        class={
          "flex items-center space-x-2 px-4 py-2 rounded-xl max-w-4xl " +
          (role === "user"
            ? "bg-neutral-900 text-white rounded-tr-md"
            : "bg-neutral-100 rounded-tl-md")
        }
      >
        <p>{content}</p>
      </div>
    </div>
  )
}
