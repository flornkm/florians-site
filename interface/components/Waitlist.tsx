import { Send } from "#design-system/Icons"
import { useRef, useState } from "preact/hooks"
import Button from "./Button"

const subscribeToWaitlist = async (email: string) => {
  const res = await fetch("/api/waitlist", {
    method: "POST",
    body: JSON.stringify({ email: email }),
  })

  return res.status
}

export default function Waitlist() {
  const mailInput = useRef<HTMLInputElement>(null)
  const [info, setInfo] = useState(
    undefined as Record<string, string> | undefined
  )
  const [loading, setLoading] = useState(false)

  const subscribe = async () => {
    setLoading(true)

    const email = mailInput.current!.value

    if (
      email === "" ||
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/i.test(email) === false
    ) {
      setLoading(false)
      return setInfo({
        message: "Please enter a valid email address.",
        type: "error",
      })
    }

    const status = await subscribeToWaitlist(email)

    if (status !== 200) {
      setLoading(false)
      return setInfo({ message: "Something went wrong.", type: "error" })
    }

    setLoading(false)
    mailInput.current!.value = ""
    setInfo({ message: "You're on the list!", type: "success" })
  }

  return (
    <div class="w-full py-4">
      <div
        class={
          "flex gap-4 group sticky bottom-0.5 -left-1 -right-1 " +
          (loading ? "cursor-not-allowed" : "")
        }
      >
        <form class="relative w-full" onSubmit={(e) => e.preventDefault()}>
          <input
            onInput={() => {
              if (info) setInfo(undefined)
            }}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                subscribe()
              }
            }}
            ref={mailInput}
            type="text"
            placeholder="john.doe@domain.com"
            class={
              "w-full placeholder:text-zinc-400 relative top-[1px] disabled:cursor-not-allowed outline-0 outline-zinc-500/0 transition-all focus:outline-4 focus:outline-zinc-500/10 outline-offset-1 px-6 py-3 rounded-full bg-white border dark:bg-zinc-800 dark:placeholder:text-zinc-500 dark:focus:outline-none " +
              (info && info.type === "error"
                ? "border-red-200 focus:border-red-300 text-red-500 dark:border-red-700/50 dark:focus:border-red-700"
                : info && info.type === "success"
                ? "border-green-200 focus:border-green-300 text-green-500 dark:border-green-700/50 dark:focus:border-green-700"
                : "border-zinc-200 focus:border-zinc-300 dark:border-zinc-700/50 dark:focus:border-zinc-700") +
              (loading ? " opacity-50 pointer-events-none" : "")
            }
          />
          <Button
            function={() => {
              subscribe()
            }}
            rounded
            type="primary"
            class={
              "absolute right-1 top-1/2 -translate-y-1/2 group/button leading-none overflow-hidden md:hover:pl-28 mt-[1px] " +
              (loading ? "pointer-events-none opacity-50" : "")
            }
          >
            <>
              <p class="absolute hidden md:block transition-all opacity-0 md:group-hover/button:block group-hover/button:opacity-100 -left-[100%] group-hover/button:left-4 duration-200">
                Subscribe
              </p>
              <Send class="w-5 h-5 rotate-90" />
            </>
          </Button>
        </form>
      </div>
      {info && info.message && info.type === "error" ? (
        <p class="text-red-500 text-sm mt-2 ml-6">{info.message}</p>
      ) : info && info.message && info.type === "success" ? (
        <p class="text-green-500 text-sm mt-2 ml-6">{info.message}</p>
      ) : undefined}
    </div>
  )
}
