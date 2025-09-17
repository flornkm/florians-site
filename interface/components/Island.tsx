import { JSX } from "preact/jsx-runtime"
import { Chevron } from "#design-system/Icons"

export default function Island(props: {
  icon?: JSX.Element
  link: string
  children: string | JSX.Element
  class?: string
}) {
  return (
    <a
      class={
        "sticky px-6 overflow-hidden py-3 max-w-xl mx-auto group rounded-full focus:rounded-full font-medium z-20 top-8 lg:bottom-8 w-full bg-white border border-neutral-200 shadow-xl shadow-neutral-500/5 mb-12 flex justify-between items-center dark:bg-neutral-950 dark:border-neutral-900 " +
        props.class
      }
      href={props.link}
      target={props.link.includes("http") ? "_blank" : "_self"}
    >
      <div class="flex items-center gap-4">
        {props.icon} {props.children}
      </div>
      <Chevron class="transition-all relative mr-0 group-hover:-mr-1" />
    </a>
  )
}
