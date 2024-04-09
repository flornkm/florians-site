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
          "text-xl p-1 rounded-md transition-colors hover:text-black hover:bg-neutral-100 before:opacity-0 dark:hover:text-white dark:hover:bg-neutral-900 " +
          (open
            ? "text-black dark:text-white bg-neutral-100 dark:bg-neutral-900"
            : "text-neutral-400")
        }
      >
        {props.children}
      </button>
      <div
        // @ts-ignore
        ref={elementsList}
        class={
          "absolute p-1 z-10 bg-neutral-50 shadow-lg shadow-black/5 border border-neutral-200 rounded-lg flex flex-col gap-1 transition-all duration-100 overflow-hidden dark:bg-black dark:border-neutral-800 " +
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
              class="px-3 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-neutral-100 flex items-center gap-1.5 justify-start dark:hover:bg-neutral-900"
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
          "text-xl p-1 rounded-md transition-colors hover:text-black hover:bg-neutral-200 before:opacity-0 dark:hover:text-white dark:hover:bg-neutral-800 " +
          (open
            ? "text-black dark:text-white bg-neutral-200 dark:bg-neutral-800"
            : "text-neutral-400")
        }
      >
        <Translate size={24} />
      </button>
      <div
        // @ts-ignore
        ref={elementsList}
        class={
          "absolute p-1 z-10 bg-neutral-50 shadow-lg shadow-black/5 border border-neutral-200 rounded-lg flex flex-col gap-1 transition-all duration-100 overflow-hidden dark:bg-neutral-900 dark:border-neutral-800 " +
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
                "px-3 py-1.5 rounded-md transition-colors hover:bg-neutral-100 flex items-center gap-1.5 justify-end dark:hover:bg-neutral-800"
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
