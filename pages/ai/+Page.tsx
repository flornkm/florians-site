import Button from "#components/Button"
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks"
import { Send } from "#design-system/Icons"
import LoadingSpinner from "#components/LoadingSpinner"

const decoder = new TextDecoder()

export default function Page() {
  const chatInput = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<
    { role: string; content: string; timestamp: string }[]
  >([])
  const [generatedText, setGeneratedText] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const chatWrapper = useRef<HTMLDivElement>(null)

  const sendToAI = useCallback(async () => {
    const input = chatInput.current!.value
    if (input === "") return

    setLoading(true)

    chatInput.current!.value = ""
    setMessages([
      ...messages,
      { role: "user", content: input, timestamp: new Date().toISOString() },
    ])

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
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
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (error) {
      setError("Error fetching data from server.")
      console.error("Error fetching data from server.", error)
    }

    setGeneratedText([])
    setLoading(false)
  }, [messages, setMessages, setGeneratedText])

  useEffect(() => {
    if (chatInput.current) chatInput.current.focus()
  }, [messages])

  return (
    <div class="w-full">
      <Introduction focusChat={() => chatInput.current?.focus()} />
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
              "w-full placeholder:text-neutral-400 relative pr-20 truncate top-[1px] disabled:cursor-not-allowed outline-0 outline-neutral-500/0 transition-all focus:outline-4 focus:outline-neutral-500/10 outline-offset-1 px-6 py-3 rounded-full bg-white border dark:bg-neutral-800 dark:placeholder:text-neutral-500 dark:focus:outline-none " +
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
          {messages.length === 0 && (
            <div class="bg-[url('/images/assets/empty-chat.jpg')] opacity-40 bg-no-repeat top-56 w-[400px] mx-auto bg-contain absolute inset-0" />
          )}
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {loading && (
            <ChatBubble
              key={messages.length}
              role="system"
              content={
                generatedText.map((text) => text).join("") === ""
                  ? "..."
                  : generatedText.map((text) => text).join("")
              }
              timestamp={new Date().toISOString()}
            />
          )}
          {error && <p>{error}</p>}
        </div>
      </section>
    </div>
  )
}

const Introduction = ({ focusChat }: { focusChat?: () => void }) => {
  const [hideIntro, setHideIntro] = useState<boolean>(false)
  const [ready, setReady] = useState<boolean>(false)

  const tooNarrow = useMemo(() => {
    if (typeof window !== "undefined" && window.innerHeight < 850) {
      return true
    }

    return false
  }, [])

  useEffect(() => {
    if (!hideIntro) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [hideIntro])

  return (
    <div
      class={
        "w-screen h-screen flex items-center justify-center fixed inset-0 transition-all " +
        (hideIntro ? "pointer-events-none z-[52]" : "bg-white z-50")
      }
    >
      <div class="flex flex-col items-center max-w-md">
        <div
          class={
            "bg-white relative z-[52] px-3 py-2 flex transition-all gap-2 duration-500 pointer-events-auto border " +
            (hideIntro
              ? "lg:-translate-y-[38vh] -translate-y-[39vh] shadow-lg rounded-xl border-neutral-200 w-56 "
              : "translate-x-0 mb-8 rounded-none border-white w-32 ") +
            (tooNarrow ? "hidden" : "")
          }
        >
          <div
            class={
              "aspect-square rounded-full transition-all duration-500 bg-[url('/images/avatars/memoji-placeholder.jpg')] bg-cover " +
              (hideIntro ? "w-12" : "w-24")
            }
          ></div>
          <div
            class={
              "mb-2 transition-all absolute top-1/2 p-1.5 -translate-y-1/2 truncate duration-500 z-10 " +
              (hideIntro
                ? "opacity-100 left-[72px]"
                : "opacity-0 blur-xl pointer-events-none")
            }
          >
            <h2 class="font-medium">Florian's AI Clone</h2>
            <p class="text-neutral-500 text-sm">Online 24/7</p>
          </div>
        </div>
        {!ready ? (
          <div
            class={
              "flex items-center flex-col w-full transition-all h-32 " +
              (hideIntro ? "opacity-0 blur-lg" : "opacity-100 blur-none")
            }
          >
            <h1 class="text-2xl font-bold mb-2 text-center">
              Talk to my AI clone
            </h1>
            <p class="text-center mb-8 text-neutral-500">
              This AI is a clone of me, especially useful for employees who want
              to ask me questions when I'm not around.
            </p>
            <Button
              function={() => {
                setHideIntro(true)
                focusChat?.()
                setTimeout(() => {
                  setReady(true)
                }, 500)
              }}
              type="primary"
            >
              Get Started
            </Button>
          </div>
        ) : (
          <div class="h-32" />
        )}
      </div>
    </div>
  )
}

const ChatBubble = ({
  role,
  content,
  timestamp,
}: {
  role: string
  content: string
  timestamp: string
}) => {
  return (
    <div
      class={
        "flex items-center space-x-4 mb-4 " +
        (role === "user" ? "justify-end" : "justify-start")
      }
    >
      <div
        class={
          "flex lg:items-center md:gap-4 gap-2 flex-col " +
          (role === "user" ? "lg:flex-row" : "lg:flex-row-reverse")
        }
      >
        <div
          class={
            "flex items-center space-x-2 px-4 py-2 rounded-xl max-w-2xl " +
            (role === "user"
              ? "bg-neutral-900 text-white rounded-tr-md"
              : "bg-neutral-100 rounded-tl-md")
          }
        >
          <p>{content}</p>
        </div>
        <p
          class={
            "text-neutral-500 text-xs " +
            (role === "user" ? "lg:text-right" : "lg:text-left")
          }
        >
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
