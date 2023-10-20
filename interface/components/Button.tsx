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
  function?: () => void
}) {
  return (
    <button
      onClick={() => {
        props.link &&
          (props.link.includes("http")
            ? window.open(props.link)
            : navigate(props.link))
        props.function && props.function()
      }}
      class={
        "flex items-center gap-1 outline-transparent focus:outline-2 focus:outline-blue-500 " +
        (props.small ? "text-sm px-3 py-2 " : " ") +
        props.class +
        " " +
        (props.type !== "text"
          ? "font-semibold rounded-xl transition-all duration-200 border px-5 py-2.5 " +
            (props.type === "primary"
              ? "text-white bg-black hover:bg-zinc-800 border-zinc-800 hover:border-zinc-600"
              : "text-black bg-zinc-50 hover:bg-white hover:text-zinc-800 border-zinc-200")
          : "text-zinc-800 hover:underline underline-offset-2 font-semibold rounded-md px-1.5 " +
            (props.chevron ? "pr-0" : "") +
            (props.link?.includes("http") ? "cursor-alias" : ""))
      }
      style={{
        borderRadius: props.rounded ? 1000 : "",
      }}
    >
      {props.icon}
      {props.children}
      {props.chevron && <Chevron />}
    </button>
  )
}

export function ButtonWrapper(props: {
  children: JSX.ElementChildrenAttribute | JSX.Element[]
}) {
  return <div class="flex gap-4">{props.children}</div>
}
