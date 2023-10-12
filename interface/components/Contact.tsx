import IconAccountBox from "~icons/eva/message-square-outline"
import At from "~icons/eva/at-fill"
import LinkedIn from "~icons/eva/linkedin-outline"
import Send from "~icons/eva/arrow-circle-up-fill"
import Button from "./Button"
import Tooltip from "./Tooltip"
import { useRef, useState } from "preact/hooks"

type Message = {
  message: string
  position: "left" | "right"
}

export default function Contact() {
  const chatInput = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState([
    {
      message: `Hey, what is your name? ✨`,
      position: "left",
    },
  ] as Message[])

  const sendMessage = () => {
    if (chatInput.current!.value !== "") {
      setMessages([
        ...messages,
        {
          message: chatInput.current!.value,
          position: "right",
        },
      ])
      chatInput.current!.value = ""
    }
  }

  return (
    <>
      <div class="w-full py-4 flex justify-between gap-8">
        <div class="flex items-center gap-3">
          <p class="font-medium">
            <span class="text-zinc-400">To: </span>Florian
          </p>
          <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div class="flex items-center gap-6">
          <Button style="text" class="flex items-end gap-1">
            <>
              <At class="w-5 h-5" />
              <p class="mt-0.5">LinkedIn</p>
            </>
          </Button>
          <Button style="text" class="flex items-end gap-1 relative group">
            <>
              <At class="w-5 h-5" />
              <p class="mt-0.5">X</p>
              <Tooltip position="top" class="-mt-3">
                Former Twitter
              </Tooltip>
            </>
          </Button>
          <Button style="text" class="flex items-end gap-1">
            <>
              <At class="w-5 h-5" />
              <p class="mt-0.5">E-Mail</p>
            </>
          </Button>
        </div>
      </div>
      <div class="mx-auto bg-zinc-50 flex flex-col justify-end w-full h-[612px] rounded-b-[32px] rounded-t-2xl">
        <div class="h-full w-full p-8 flex flex-col gap-2 overflow-y-scroll">
          {messages.map((message) => (
            <ChatBubble position={message.position}>
              {message.message}
            </ChatBubble>
          ))}
        </div>
        <div class="flex gap-4 group">
          <div class="relative w-full">
            <input
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage()
                }
              }}
              ref={chatInput}
              type="text"
              placeholder="Message..."
              class="w-full placeholder:text-zinc-400 outline-0 outline-zinc-500/0 transition-all focus:outline-8 focus:outline-zinc-500/10 focus:border-zinc-300 outline-offset-2 px-6 py-3 rounded-full bg-white border border-zinc-200"
            />
            <Button
              function={() => {
                sendMessage()
              }}
              rounded
              style="primary"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 group/button leading-none overflow-hidden md:hover:pl-16"
            >
              <p class="absolute hidden md:block transition-all opacity-0 md:group-hover/button:block group-hover/button:opacity-100 -left-[100%] group-hover/button:left-4 duration-200">
                Send
              </p>
              <Send class="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function ChatBubble(props: { children: string; position: "left" | "right" }) {
  return (
    <div
      class={
        "px-4 py-2 text-white rounded-2xl max-w-[80%] relative " +
        (props.position === "left"
          ? "self-start rounded-tl-md bg-zinc-400"
          : "self-end rounded-tr-md bg-zinc-600")
      }
    >
      {props.children}
    </div>
  )
}
