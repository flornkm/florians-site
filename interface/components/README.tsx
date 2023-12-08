import Edit from "~icons/eva/edit-outline"
import * as m from "#lang/paraglide/messages"
import { JSX } from "preact/jsx-runtime"

export default function README(props: { children: JSX.Element }) {
  return (
    <div class="bg-zinc-50 border border-zinc-200 w-full rounded-xl relative dark:border-zinc-800 dark:bg-zinc-950">
      <div class="absolute -inset-[1px] border border-zinc-200 rounded-xl z-30 pointer-events-none ring-4 ring-light-zinc dark:ring-black dark:border-zinc-800" />
      <div class="flex justify-between items-center w-full py-2 pl-4 pr-2 border-b border-zinc-200 bg-zinc-100 sticky top-0 lg:top-14 dark:bg-zinc-900 dark:border-zinc-800">
        <p class="text-zinc-500 text-sm text-center dark:text-zinc-400 font-mono">
          README.md
        </p>
        <Edit class="w-6 h-6 text-zinc-500 dark:text-zinc-400 p-0.5 hover:bg-zinc-200 transition-colors rounded-md cursor-not-allowed dark:hover:bg-zinc-800" />
      </div>
      <div class="w-full px-4 py-8">{props.children}</div>
    </div>
  )
}
