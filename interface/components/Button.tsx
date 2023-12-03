import { getLocale } from "#hooks/getLocale"
import { JSX } from "preact/jsx-runtime"
import { navigate } from "vike/client/router"
import Chevron from "~icons/eva/arrow-ios-forward-outline"

export default function Button(props: {
  type: "primary" | "secondary" | "text"
  rounded?: boolean
  link?: string
  children: Element | string | JSX.Element
  icon?: JSX.Element
  chevron?: boolean
  class?: string
  small?: boolean
  disabled?: boolean
  function?: () => void
}) {
  return (
    <button
      disabled={props.disabled}
      onClick={() => {
        props.link &&
          (props.link.includes("http")
            ? window.open(getLocale() + props.link)
            : navigate(getLocale() + props.link))
        props.function && props.function()
      }}
      class={
        "flex items-center gap-1 outline-transparent focus:outline-2 focus:outline-blue-50 disabled:cursor-not-allowed " +
        (props.small ? "text-sm px-3 py-2 " : " ") +
        props.class +
        " " +
        (props.type !== "text"
          ? "font-semibold rounded-xl transition-all duration-200 border px-5 py-2.5 " +
            (props.type === "primary"
              ? "text-white bg-black hover:bg-zinc-800 border-zinc-800 hover:border-zinc-600 dark:text-black dark:bg-white dark:hover:bg-zinc-200 dark:border-zinc-200 dark:hover:border-zinc-400"
              : "text-black bg-zinc-50 hover:bg-white hover:text-zinc-800 border-zinc-200 dark:text-white dark:bg-zinc-900 dark:hover:bg-zinc-950 dark:hover:text-zinc-200 dark:border-zinc-800")
          : "text-zinc-800 hover:underline underline-offset-2 font-semibold rounded-md px-1.5 dark:text-zinc-200 " +
            (props.chevron ? "pr-0" : "") +
            (props.link?.includes("http") ||
            props.link?.includes("mailto") ||
            props.link?.includes("imessage")
              ? "cursor-alias"
              : ""))
      }
      style={{
        borderRadius: props.rounded ? 1000 : "",
      }}
    >
      {props.icon}
      {props.children}
      {props.chevron && <Chevron class="flex-shrink-0" />}
    </button>
  )
}

export function ButtonWrapper(props: {
  children: JSX.ElementChildrenAttribute | JSX.Element[]
}) {
  return <div class="flex gap-4 flex-wrap">{props.children}</div>
}

export function InlineLink(props: {
  link: string | undefined
  children: string | JSX.Element | undefined
  class?: string
}) {
  return (
    <a
      class={
        "text-black px-0 transition-colors font-medium cursor-alias dark:text-white hover:underline underline-offset-2 " +
        (props.class ? props.class : "")
      }
      href={props.link}
      target={props.link && props.link.includes("http") ? "_blank" : "_self"}
    >
      {props.children}
    </a>
  )
}
