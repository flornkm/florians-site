import { VNode } from "preact"

export function InlineInfo(props: { children: Element | VNode }) {
  return (
    <span class="px-2 py-0.5 group bg-neutral-100 relative rounded-full text-neutral-600 inline-block cursor-help transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300">
      {props.children}
    </span>
  )
}
