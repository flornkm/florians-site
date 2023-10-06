import { JSX } from "preact/jsx-runtime"
import { navigate } from "vike/client/router"

export default function Button(props: {
  style: "primary" | "secondary" | "text"
  link: string
  children: JSX.ElementChildrenAttribute | string
}) {
  return (
    <button
      onClick={() => {
        navigate(props.link)
      }}
      class={
        (props.style !== "text" &&
          "font-semibold rounded-lg px-5 py-2.5 transition-all duration-200 border " +
            (props.style === "primary"
              ? "text-white bg-black hover:bg-zinc-800 border-zinc-900 hover:border-zinc-700"
              : "text-black bg-zinc-50 hover:bg-white hover:text-zinc-800")) ||
        "text-zinc-800 hover:underline underline-offset-2 font-semibold"
      }
    >
      {props.children}
    </button>
  )
}

export function ButtonWrapper(props: {
  children: JSX.ElementChildrenAttribute | JSX.Element[]
}) {
  return <div class="flex gap-4">{props.children}</div>
}
