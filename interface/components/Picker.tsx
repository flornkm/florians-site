import { useState } from "preact/hooks"
import useOuterClick from "#hooks/useOuterClick"
import { JSX } from "preact/jsx-runtime"
import { languageTag, sourceLanguageTag } from "#lang/paraglide/runtime"
import { Check, Translate } from "#design-system/Icons"
import { navigate } from "vike/client/router"

type functionOption = {
  label: string
  function: () => void
}

type linkOption = {
  label: string
  link: string
}

export default function Picker(props: {
  position: "top" | "bottom"
  align: "right" | "left"
  options: (functionOption | linkOption)[]
  children: JSX.Element
}) {
  const [open, setOpen] = useState(false)
  const elementsList = useOuterClick(() => {
    if (open) setOpen(false)
  })

  return (
    <div class="flex items-center relative">
      <button
        onClick={() => (open ? setOpen(false) : setOpen(true))}
        class={
          "text-xl p-1 rounded-md transition-colors hover:text-black hover:bg-zinc-100 before:opacity-0 dark:hover:text-white dark:hover:bg-zinc-900 " +
          (open
            ? "text-black dark:text-white bg-zinc-100 dark:bg-zinc-900"
            : "text-zinc-400")
        }
      >
        {props.children}
      </button>
      <div
        // @ts-ignore
        ref={elementsList}
        class={
          "absolute z-10 bg-zinc-50 border border-zinc-200 rounded-md flex flex-col transition-all overflow-hidden dark:bg-zinc-950 dark:border-zinc-800 " +
          (props.align === "left" ? "left-0 " : "right-0 ") +
          (open
            ? "opacity-100 " +
              (props.position === "top" ? "bottom-9 " : "top-9 ")
            : "opacity-0 pointer-events-none " +
              (props.position === "top" ? "bottom-4 " : "top-4 "))
        }
      >
        {props.options.map((option) => {
          return (
            <a
              class={
                "px-3 py-1.5 cursor-pointer transition-colors hover:bg-zinc-100 flex items-center gap-1.5 justify-start dark:hover:bg-zinc-900 " +
                (props.options.length - 1 === props.options.indexOf(option)
                  ? ""
                  : " border-b border-b-zinc-200 dark:border-b-zinc-800")
              }
              href={"link" in option ? option.link : undefined}
              onClick={"function" in option ? option.function : undefined}
            >
              <p class="w-auto truncate">{option.label}</p>
            </a>
          )
        })}
      </div>
    </div>
  )
}

type Language = {
  name: string
  languageTag: string
  link: string
}

export function LanguagePicker(props: {
  position: "top" | "bottom"
  align: "right" | "left"
}) {
  const [open, setOpen] = useState(false)
  const elementsList = useOuterClick(() => {
    if (open) setOpen(false)
  })

  const languages = [
    {
      name: "English",
      languageTag: sourceLanguageTag,
      link: "/",
    },
    {
      name: "Chinese",
      languageTag: "zh",
      link: "/zh",
    },
  ] as Language[]

  return (
    <div class="flex items-center relative">
      <button
        onClick={() => (open ? setOpen(false) : setOpen(true))}
        class={
          "text-xl p-1 rounded-md transition-colors hover:text-black hover:bg-zinc-100 before:opacity-0 dark:hover:text-white dark:hover:bg-zinc-900 " +
          (open
            ? "text-black dark:text-white bg-zinc-100 dark:bg-zinc-900"
            : "text-zinc-400")
        }
      >
        <Translate size={24} />
      </button>
      <div
        // @ts-ignore
        ref={elementsList}
        class={
          "absolute z-10 bg-zinc-50 border border-zinc-200 rounded-md flex flex-col transition-all overflow-hidden dark:bg-zinc-950 dark:border-zinc-800 " +
          //   (props.position === "top" ? "bottom-8 " : "top-8 ") +
          (props.align === "left" ? "left-0 " : "right-0 ") +
          (open
            ? "opacity-100 " +
              (props.position === "top" ? "bottom-9 " : "top-9 ")
            : "opacity-0 pointer-events-none " +
              (props.position === "top" ? "bottom-4 " : "top-4 "))
        }
      >
        {languages.map((locale) => {
          return (
            <a
              class={
                "px-3 py-1.5 transition-colors hover:bg-zinc-100 flex items-center gap-1.5 justify-end dark:hover:bg-zinc-900 " +
                (languages.length - 1 === languages.indexOf(locale)
                  ? ""
                  : " border-b border-b-zinc-200 dark:border-b-zinc-800")
              }
              href={locale.link}
              onClick={(e) => {
                e.preventDefault()
                navigate(locale.link).then(() =>
                  window.open(locale.link, "_self")
                )
              }}
            >
              {locale.languageTag === languageTag() && <Check />}
              <p class="w-16">{locale.name}</p>
            </a>
          )
        })}
      </div>
    </div>
  )
}
