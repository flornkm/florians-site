import { JSX } from "preact/jsx-runtime"

export default function Tooltip(props: {
  children: string | JSX.Element
  position: "top" | "left" | "right" | "bottom"
}) {
  return (
    <div
      class={
        "opacity-0 group-hover:opacity-100 delay-300 scale-90 group-hover:scale-100 ring-2 ring-white pointer-events-none transition-all ease-out absolute text-sm px-2 py-1 rounded-full bg-black z-40 text-white " +
        (props.position === "top"
          ? "-top-5 group-hover:-top-6 left-[50%] translate-x-[-50%]"
          : "") +
        (props.position === "bottom"
          ? "-bottom-5 group-hover:-bottom-6 left-[50%] translate-x-[-50%]"
          : "") +
        (props.position === "left"
          ? "left-5 group-hover:-left-6 top-[50%] translate-y-[-50%]"
          : "") +
        (props.position === "right"
          ? "right-5 group-hover:-right-6 top-[50%] translate-y-[-50%]"
          : "")
      }
    >
      <div
        class={
          "w-2.5 h-2.5 rounded-sm bg-black absolute delay-200 scale-75 group-hover:scale-100 transition-transform duration-150 z-30 transform rotate-45 " +
          (props.position === "top"
            ? "-bottom-1 left-[50%] translate-x-[-50%]"
            : "") +
          (props.position === "bottom"
            ? "-top-1 left-[50%] translate-x-[-50%]"
            : "") +
          (props.position === "left"
            ? "-right-0.5 top-[50%] translate-y-[-50%]"
            : "") +
          (props.position === "right"
            ? "-left-0.5 top-[50%] translate-y-[-50%]"
            : "")
        }
      />
      <p class="z-50 relative truncate">{props.children}</p>
    </div>
  )
}
