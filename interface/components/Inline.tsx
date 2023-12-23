import { VNode } from "preact"

export function InlineInfo(props: { children: Element | VNode }) {
  return (
    <span class="px-2 py-0.5 group bg-zinc-100 relative rounded-full text-zinc-600 inline-block cursor-help transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-300">
      {props.children}
    </span>
  )
}
