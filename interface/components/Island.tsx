import { JSX } from "preact/jsx-runtime"
import Chevron from "~icons/eva/arrow-ios-forward-outline"

export default function Island(props: {
  icon?: JSX.Element
  link: string
  children: string | JSX.Element
}) {
  return (
    <a
      class="sticky px-6 py-3 group rounded-full font-medium top-[90vh] w-full bg-white border border-zinc-200 shadow-xl shadow-zinc-500/5 mb-12 flex justify-between items-center dark:bg-zinc-900 dark:border-zinc-800"
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
