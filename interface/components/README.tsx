import { Edit } from "#design-system/Icons"
import { JSX } from "preact/jsx-runtime"

export default function README(props: {
  class?: string
  children: JSX.Element
}) {
  return (
    <div class="bg-neutral-50 border border-neutral-200 w-full rounded-xl relative dark:border-neutral-800 dark:bg-neutral-950 shadow-lg shadow-black/5 mt-8">
      <div class="absolute -inset-[1px] border border-neutral-200 rounded-xl z-30 pointer-events-none dark:border-neutral-800" />
      <div class="flex justify-between items-center w-full py-2 pl-4 pr-2 border-b border-neutral-200 bg-neutral-100 sticky dark:bg-neutral-900 dark:border-neutral-800 top-0 lg:top-14">
        <p class="text-neutral-500 text-sm text-center dark:text-neutral-400 font-mono">
          README.md
        </p>
        <Edit class="w-6 h-6 text-neutral-500 dark:text-neutral-400 p-1 hover:bg-neutral-200 transition-colors rounded-md cursor-not-allowed dark:hover:bg-neutral-800" />
      </div>
      <div class="w-full px-4 py-8">{props.children}</div>
    </div>
  )
}
