import IconAccountBox from "~icons/eva/message-square-outline"
import Mail from "~icons/eva/at-fill"
import Button from "./Button"
import Tooltip from "./Tooltip"

export default function Contact() {
  return (
    <div class="mx-auto bg-white border rounded-3xl border-zinc-200/75 flex flex-col w-full h-[612px]">
      <div class="w-full px-6 py-8 md:py-4 flex justify-between items-center relative">
        <div class="flex items-center gap-4">
          <p class="font-medium">Contact me:</p>
          <div class="flex gap-3 flex-wrap">
            <Button
              class="-rotate-2"
              style="primary"
              rounded
              link="mailto:hello@floriankiem.com"
              icon={<Mail />}
            >
              E-Mail
            </Button>
            <Button
              class="rotate-1"
              style="secondary"
              rounded
              link="mailto:hello@floriankiem.com"
              icon={<Mail />}
            >
              LinkedIn
            </Button>
            <Button
              class="-rotate-3 relative group"
              style="secondary"
              rounded
              link="mailto:hello@floriankiem.com"
              icon={<Mail />}
            >
              X<Tooltip position="top">Former Twitter</Tooltip>
            </Button>
          </div>
        </div>
        <div class="absolute left-1/2 -translate-x-1/2 -bottom-3 flex items-center gap-3 w-full">
          <div class="h-[1px] w-full bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-800" />
          <div class="flex items-center gap-2">
            <p class="font-medium mr-2">or </p>
            <IconAccountBox class="w-4 h-4 flex-shrink-0" />
            <p class="font-medium">Chat</p>
          </div>
          <div class="h-[1px] w-full bg-gradient-to-l from-zinc-200 via-zinc-300 to-zinc-800" />
        </div>
      </div>
      <div class="bg-zinc-50 h-full rounded-b-3xl"></div>
    </div>
  )
}
