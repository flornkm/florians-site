export function InlineInfo(props: { children: Element | string[] }) {
  return (
    <span class="px-2 py-0.5 group bg-zinc-100 relative rounded-full text-zinc-600 inline-block cursor-help transition-colors hover:bg-zinc-200 hover:text-zinc-700">
      {props.children}
    </span>
  )
}
