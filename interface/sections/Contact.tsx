import Send from "~icons/eva/arrow-circle-up-fill"
import Button from "../components/Button"
import { useRef, useState } from "preact/hooks"
import * as m from "#lang/paraglide/messages"

type Message = {
  message: string
  position: "left" | "right"
  time: Date
}

const sendData = async (messages: string[]) => {
  const data = {
    name: messages[0],
    message: messages[1],
    email: messages[2],
  }

  const response = await fetch(import.meta.env.VITE_FORMSPREE_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Accept: "application/json",
    },
  })
  return response
}

export default function Contact() {
  const chatInput = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState([
    {
      message: m.chat_message_what_name(),
      position: "left",
      time: new Date(),
    },
  ] as Message[])

  const displayMessage = (message: string) => {
    const tempMsg = chatInput.current!.value
    setMessages([
      ...messages,
      {
        message: chatInput.current!.value,
        position: "right",
        time: new Date(),
      },
    ])
    chatInput.current!.value = ""
    setTimeout(() => {
      setMessages([
        ...messages,
        {
          message: tempMsg,
          position: "right",
          time: new Date(),
        },
        {
          message: message,
          position: "left",
          time: new Date(),
        },
      ])
      setTimeout(() => {
        chatInput.current!.focus()
      }, 50)
    }, 1000)
  }

  const sendMessage = () => {
    if (chatInput.current && chatInput.current!.value !== "") {
      if (messages.length === 1) {
        displayMessage(m.chat_message_what_can_do())
      } else if (messages.length === 3) {
        displayMessage(m.chat_message_got_it())
      } else if (messages.length === 5) {
        displayMessage(m.chat_message_reach_out_soon())
      }
    }
  }

  const loading = () =>
    messages.length !== 1 && messages.length !== 3 && messages.length !== 5
      ? true
      : false

  return (
    <>
      <div class="w-full py-4 flex md:flex-row flex-col-reverse justify-between gap-6 md:gap-8">
        <div class="flex items-center gap-3">
          <p class="font-medium text-lg">
            <span class="text-zinc-400 dark:text-zinc-500">
              {m.message_to()}{" "}
            </span>
            Florian
          </p>
          <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div class="flex xs:items-center gap-2 xs:gap-4 xs:flex-row flex-col md:justify-end lg:w-full lg:max-w-s">
          <p class="text-zinc-400 dark:text-zinc-500">
            {m.message_contact_via()}
          </p>
          <Button
            type="text"
            class="flex items-end gap-1"
            link="mailto:hello@floriankiem.com"
          >
            {m.button_email()}
          </Button>
          <Button
            type="text"
            class="flex items-end gap-1"
            link="imessage://hello@floriankiem.com"
          >
            {m.button_imessage()}
          </Button>
        </div>
      </div>
      <div class="mx-auto bg-zinc-100 border border-zinc-200 flex flex-col justify-end w-full h-[652px] rounded-b-[32px] rounded-t-2xl dark:bg-zinc-950 dark:border-zinc-900 relative">
        <div class="h-full w-full xs:p-8 p-4 flex flex-col gap-3 overflow-y-scroll custom-scrollbar relative mb-12">
          {messages.map((message) => (
            <ChatBubble position={message.position} date={message.time}>
              {message.message}
            </ChatBubble>
          ))}
          {messages.length === 3 && (
            <div class="absolute bottom-4 md:gap-4 gap-2 items-center flex-wrap hidden xs:flex md:pr-8 pr-4">
              <p>{m.message_often_used()}</p>
              <Button
                function={() => {
                  chatInput.current!.value = m.button_freelance_work()
                  sendMessage()
                }}
                small
                type="secondary"
              >
                {m.button_freelance_work()}
              </Button>
              <Button
                function={() => {
                  chatInput.current!.value = m.button_job_opportunity()
                  sendMessage()
                }}
                small
                type="secondary"
              >
                {m.button_job_opportunity()}
              </Button>
              <Button
                function={() => {
                  chatInput.current!.value = m.button_got_question()
                  sendMessage()
                }}
                small
                type="secondary"
              >
                {m.button_got_question()}
              </Button>
              <Button
                function={() => {
                  chatInput.current!.value = m.button_drink_beer()
                  sendMessage()
                }}
                small
                type="secondary"
              >
                {m.button_drink_beer()}
              </Button>
            </div>
          )}
        </div>
        <div class="flex gap-4 group absolute -left-1 -right-1">
          <div class="relative w-full">
            <input
              disabled={loading()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (messages.length === 5) {
                    sendData([
                      messages[1].message,
                      messages[3].message,
                      chatInput.current!.value,
                    ]).then((response) => {
                      if (response.status === 200) sendMessage()
                      else displayMessage(m.chat_message_error())
                    })
                  } else sendMessage()
                }
              }}
              ref={chatInput}
              type="text"
              placeholder={m.message_placeholder()}
              class="w-full placeholder:text-zinc-400 relative top-[1px] disabled:opacity-30 disabled:cursor-not-allowed outline-0 outline-zinc-500/0 transition-all focus:outline-4 focus:outline-zinc-500/10 focus:border-zinc-300 outline-offset-1 px-6 py-3 rounded-full bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700 dark:focus:outline-none shadow-md shadow-black/5"
            />
            <Button
              function={() => {
                if (messages.length === 5) {
                  sendData([
                    messages[1].message,
                    messages[3].message,
                    chatInput.current!.value,
                  ]).then((response) => {
                    if (response.status === 200) sendMessage()
                    else displayMessage(m.chat_message_error())
                  })
                } else sendMessage()
              }}
              rounded
              type="primary"
              class={
                "absolute right-1 top-1/2 -translate-y-1/2 group/button leading-none overflow-hidden md:hover:pl-16 mt-[1px] " +
                (loading() ? "opacity-30 pointer-events-none" : "")
              }
            >
              <>
                <p class="absolute hidden md:block transition-all opacity-0 md:group-hover/button:block group-hover/button:opacity-100 -left-[100%] group-hover/button:left-4 duration-200">
                  {m.button_send()}
                </p>
                <Send class="w-5 h-5" />
              </>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function ChatBubble(props: {
  children: string
  position: "left" | "right"
  date: Date
}) {
  const time =
    new Date(props.date).getHours() + ":" + new Date(props.date).getMinutes()
  return (
    <div
      class={
        "xs:max-w-[80%] w-full flex flex-col " +
        (props.position === "left"
          ? "self-start items-start"
          : "self-end items-end")
      }
    >
      <div
        class={
          "px-4 py-2 text-white rounded-2xl relative " +
          (props.position === "left"
            ? "rounded-tl-md bg-zinc-400 selection:bg-zinc-500 selection:text-white dark:bg-zinc-800"
            : "rounded-tr-md bg-zinc-600 selection:bg-zinc-700 selection:text-white dark:bg-zinc-600")
        }
      >
        {props.children}
      </div>
      <p
        class={
          "text-zinc-400 text-xs mt-1.5 " +
          (props.position === "left" ? "ml-2" : "mr-2")
        }
      >
        {props.position === "left" ? "Florian" : m.message_you()} {m.time_at()}{" "}
        {time}
      </p>
    </div>
  )
}
