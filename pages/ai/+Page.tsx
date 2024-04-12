import Button from "#components/Button"
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks"
import { Send } from "#design-system/Icons"
import LoadingSpinner from "#components/LoadingSpinner"
import { AiSwitch } from "#components/Navigation"

const decoder = new TextDecoder()

export default function Page() {
  const chatInput = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<
    { role: string; content: string; timestamp: string }[]
  >([])
  const [generatedText, setGeneratedText] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false)
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
      const secret = localStorage.getItem("florians-ai-secret")
      if (!secret) return setError("Secret key not found.")

      const response = await fetch("/api/ai/text", {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: secret,
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

  const sendToReadAI = useCallback(async (message: string) => {
    try {
      const secret = localStorage.getItem("florians-ai-secret")
      if (!secret) return setError("Secret key not found.")

      const response = await fetch("/api/ai/voice", {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: secret, message }),
      })

      const mediaSource = new MediaSource()
      const audio = new Audio()
      audio.src = URL.createObjectURL(mediaSource)

      audio.play().then(() => {
        setAudioPlaying(true)

        setTimeout(() => {
          setAudioPlaying(false)
        }, message.length * 50)
      })

      let sourceBuffer: SourceBuffer | null = null

      mediaSource.addEventListener("sourceopen", () => {
        sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg")
        receiveAudioData()
      })

      const reader = response.body!.getReader()

      const receiveAudioData = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read()
            if (value && sourceBuffer) {
              if (!sourceBuffer.updating) {
                sourceBuffer.appendBuffer(value)
              } else {
                await new Promise((resolve) => {
                  sourceBuffer!.addEventListener("updateend", resolve, {
                    once: true,
                  })
                })
                sourceBuffer.appendBuffer(value)
              }
            }
            if (done) {
              break
            }
          }
        } catch (error) {
          console.error("Error reading audio data:", error)
        }
      }
    } catch (error) {
      setError("Error fetching data from server.")
      console.error("Error fetching data from server.", error)
    }
  }, [])

  useEffect(() => {
    if (chatInput.current) chatInput.current.focus()
  }, [messages])

  return (
    <div class="w-full">
      <Introduction focusChat={() => chatInput.current?.focus()} />
      <section class="w-full min-h-screen flex-col">
        <form
          class="w-full lg:max-w-xl mx-auto sticky z-40 lg:top-[90vh] top-[80vh] md:mb-16 shadow-lg rounded-full mb-4 lg:mb-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            ref={chatInput}
            disabled={
              loading ||
              (messages.length > 0 &&
                messages[messages.length - 1].content === "Unauthorized")
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                sendToAI()
              }
            }}
            type="text"
            placeholder="Ask me anything!"
            class={
              "w-full placeholder:text-neutral-400 relative pr-20 truncate top-[1px] disabled:cursor-not-allowed outline-0 transition-all outline-offset-1 px-6 py-3 rounded-full bg-white border border-neutral-200 focus:border-neutral-300 dark:border-neutral-800 dark:focus:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500 " +
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
              "absolute right-2 top-1/2 -translate-y-1/2 group/button leading-none overflow-hidden md:hover:pl-16 mt-[1px] " +
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
        <div
          class="w-full mb-8 md:-mt-24 md:pb-72 lg:pb-24 pb-72"
          ref={chatWrapper}
        >
          {messages.length === 0 && (
            <div class="bg-[url('/images/assets/empty-chat.png')] dark:bg-[url('/images/assets/empty-chat-light.png')] opacity-40 dark:opacity-100 bg-no-repeat top-56 max-w-[400px] mx-auto bg-contain absolute inset-0" />
          )}
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              playAudio={
                messages.indexOf(message) === messages.length - 1
                  ? () => sendToReadAI(message.content)
                  : undefined
              }
              audioPlaying={audioPlaying}
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
  const [secret, setSecret] = useState<string>("")
  const [error, setError] = useState<string>("")

  const tooNarrow = useMemo(() => {
    if (typeof window !== "undefined" && window.innerHeight < 850) {
      return true
    }

    return false
  }, [])

  useEffect(() => {
    if (hideIntro) document.body.style.overflow = "auto"
    else document.body.style.overflow = "hidden"
  }, [hideIntro])

  const accessHandler = useCallback(async () => {
    await fetch("/api/access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: secret }),
    }).then((response) => {
      if (response.ok) {
        localStorage.setItem("florians-ai-secret", secret)
        setHideIntro(true)
        focusChat?.()
        setTimeout(() => {
          setReady(true)
        }, 500)
      } else {
        setSecret("")
        setError("Invalid secret key. Please contact @flornkm to get access.")
      }
    })
  }, [secret])

  return (
    <div
      class={
        "w-screen h-screen flex items-center justify-center fixed inset-0 transition-all " +
        (hideIntro
          ? "pointer-events-none z-[51]"
          : "bg-white dark:bg-black lg:z-50 z-[52]")
      }
    >
      <div
        class={
          "absolute top-10 right-6 lg:hidden " +
          (hideIntro ? "opacity-0 pointer-events-none" : "opacity-100")
        }
      >
        <AiSwitch />
      </div>
      <div class="flex flex-col items-center max-w-md p-4">
        <div
          class={
            "bg-white relative z-[55] px-3 py-2 flex transition-all gap-2 duration-500 pointer-events-auto border " +
            (hideIntro
              ? "lg:-translate-y-[38vh] -translate-y-[39vh] shadow-lg rounded-xl border-neutral-200 dark:border-neutral-800 w-56 dark:bg-[#0A0A0A] "
              : "translate-x-0 mb-8 rounded-none border-white dark:border-black w-32 dark:bg-black ") +
            (tooNarrow ? "hidden" : "")
          }
        >
          <div
            class={
              "aspect-square rounded-full transition-all duration-500 bg-[url('/images/avatars/florian_student.webp')] bg-cover " +
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
            <div class="max-w-xs relative w-full">
              <input
                value={secret}
                onInput={(e) => setSecret(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    accessHandler()
                  }
                }}
                type="password"
                class="w-full px-4 py-[9px] border border-neutral-200 rounded-full pr-32 truncate outline-none focus:border-neutral-300 transition-all outline-0 focus:outline-2 focus:outline-neutral-100 outline-offset-0 dark:bg-neutral-900 dark:border-neutral-800 dark:focus:border-neutral-700 dark:focus:outline-0"
                placeholder="Secret key required"
              />
              <Button
                disabled={secret === ""}
                function={accessHandler}
                small
                type="primary"
                class="absolute right-1 z-20 top-1/2 -translate-y-1/2 truncate !rounded-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                Get Started
              </Button>
            </div>
            {error && <p class="text-sm mt-4 text-red-500">{error}</p>}
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
  playAudio,
  audioPlaying,
}: {
  role: string
  content: string
  timestamp: string
  playAudio?: () => void
  audioPlaying?: boolean
}) => {
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (audioPlaying) setLoading(false)
  }, [audioPlaying])

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
        <div>
          <div
            class={
              "flex items-center space-x-2 px-4 py-2 rounded-xl max-w-2xl " +
              (role === "user"
                ? "bg-neutral-900 text-white rounded-tr-md dark:bg-neutral-100 dark:text-black"
                : "bg-neutral-100 rounded-tl-md dark:bg-neutral-900")
            }
          >
            <p>{content}</p>
          </div>
          {role === "system" && playAudio && content !== "Unauthorized" && (
            <div
              class={
                "flex item gap-2 mt-2 " +
                (loading ? "opacity-50 cursor-not-allowed" : "")
              }
            >
              <Button
                type="secondary"
                disabled={loading}
                function={() => {
                  playAudio?.()
                  setLoading(true)
                }}
                small
              >
                Voiceclone me
              </Button>
              <div class="flex items-center gap-1">
                <div
                  class={
                    "h-4 w-1 rounded-full bg-neutral-200 dark:bg-neutral-800 " +
                    (audioPlaying ? "animate-shrink-in-height-fast" : "")
                  }
                />
                <div
                  class={
                    "h-4 w-1 rounded-full bg-neutral-200 dark:bg-neutral-800 " +
                    (audioPlaying ? "animate-shrink-in-height-slow" : "")
                  }
                />
                <div
                  class={
                    "h-4 w-1 rounded-full bg-neutral-200 dark:bg-neutral-800 " +
                    (audioPlaying ? "animate-shrink-in-height-fast" : "")
                  }
                />
                <div
                  class={
                    "h-4 w-1 rounded-full bg-neutral-200 dark:bg-neutral-800 " +
                    (audioPlaying ? "animate-shrink-in-height-medium" : "")
                  }
                />
                <div
                  class={
                    "h-4 w-1 rounded-full bg-neutral-200 dark:bg-neutral-800 " +
                    (audioPlaying ? "animate-shrink-in-height-slow" : "")
                  }
                />
                <div
                  class={
                    "h-4 w-1 rounded-full bg-neutral-200 dark:bg-neutral-800 " +
                    (audioPlaying ? "animate-shrink-in-height-fast" : "")
                  }
                />
                <div
                  class={
                    "h-4 w-1 rounded-full bg-neutral-200 dark:bg-neutral-800 " +
                    (audioPlaying ? "animate-shrink-in-height-medium" : "")
                  }
                />
                <div
                  class={
                    "h-4 w-1 rounded-full bg-neutral-200 dark:bg-neutral-800 " +
                    (audioPlaying ? "animate-shrink-in-height-fast" : "")
                  }
                />
              </div>
            </div>
          )}
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
