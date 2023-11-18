import { useState } from "preact/hooks"
import { languageTag, sourceLanguageTag } from "#lang/paraglide/runtime"
import Check from "~icons/eva/checkmark-outline"
import { navigate } from "vike/client/router"
import useOuterClick from "#hooks/useOuterClick"

type Language = {
  name: string
  languageTag: string
  link: string
}

export default function LanguagePicker(props: {
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
        <LanguageIcon />
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

function LanguageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      width="1em"
      height="1em"
      viewBox="0 0 512 512"
    >
      <title>ionicons-v5-l</title>
      <path d="M478.33,433.6l-90-218a22,22,0,0,0-40.67,0l-90,218a22,22,0,1,0,40.67,16.79L316.66,406H419.33l18.33,44.39A22,22,0,0,0,458,464a22,22,0,0,0,20.32-30.4ZM334.83,362,368,281.65,401.17,362Z" />
      <path d="M267.84,342.92a22,22,0,0,0-4.89-30.7c-.2-.15-15-11.13-36.49-34.73,39.65-53.68,62.11-114.75,71.27-143.49H330a22,22,0,0,0,0-44H214V70a22,22,0,0,0-44,0V90H54a22,22,0,0,0,0,44H251.25c-9.52,26.95-27.05,69.5-53.79,108.36-31.41-41.68-43.08-68.65-43.17-68.87a22,22,0,0,0-40.58,17c.58,1.38,14.55,34.23,52.86,83.93.92,1.19,1.83,2.35,2.74,3.51-39.24,44.35-77.74,71.86-93.85,80.74a22,22,0,1,0,21.07,38.63c2.16-1.18,48.6-26.89,101.63-85.59,22.52,24.08,38,35.44,38.93,36.1a22,22,0,0,0,30.75-4.9Z" />
    </svg>
  )
}
