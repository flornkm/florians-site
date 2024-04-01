import { VNode } from "preact"

export function InlineInfo(props: { children: Element | VNode }) {
  return (
    <span class="px-1.5 py-0 group bg-neutral-50 border border-neutral-200 relative rounded-md text-black inline-block cursor-help transition-colors hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300">
      {props.children}
    </span>
  )
}
