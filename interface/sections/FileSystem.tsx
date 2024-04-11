import { JSX } from "preact/jsx-runtime"
import { usePageContext } from "../../renderer/usePageContext"

const randomCharacters = [
  Math.random().toString(36).substring(2, 7),
  Math.random().toString(36).substring(2, 7),
  Math.random().toString(36).substring(2, 7),
  Math.random().toString(36).substring(2, 7),
  Math.random().toString(36).substring(2, 7),
]

export const tabs = [
  {
    name: "Projects",
    path: "/archive/projects",
  },
  {
    name: "Short Projects",
    path: "/archive/short-projects",
  },
  {
    name: "Copyables",
    path: "/archive/copyables",
  },
  {
    name: "Photos",
    path: "/archive/photos",
  },
  {
    name: "Posts",
    path: "/archive/posts",
  },
]

export default function FileSystem(props: {
  children: JSX.Element
  items: {
    amount: number
    label: string
  }
}) {
  const pageContext = usePageContext() as any
  const { urlPathname } = pageContext

  return (
    <section class="w-full flex flex-col lg:flex-row py-4 md:mb-4 mb-12">
      <div class="lg:max-w-[calc((100%-432px)/2)] w-full mb-4 md:mb-8 h-full">
        <h1 class="text-2xl line-clamp-2 mb-6 text-neutral-400 selection:bg-blue-50 selection:text-blue-300 dark:text-neutral-500 dark:selection:bg-blue-950 dark:selection:text-blue-500 font-semibold leading-snug transition-colors group hover:text-neutral-400">
          Archive
        </h1>
        <ul class="space-y-2 sticky top-24 mb-8 lg:mb-0 hidden lg:block w-full lg:pr-8">
          <li class="w-full flex items-center justify-between">
            <a
              href="/archive"
              class={
                "underline-offset-2 hover:underline font-medium " +
                (urlPathname === "/archive"
                  ? ""
                  : "text-neutral-400 dark:text-neutral-500")
              }
            >
              root
            </a>
            {urlPathname === "/archive" ? (
              <span>{`${props.items.amount} ${props.items.label}`}</span>
            ) : (
              <span class="text-neutral-300 dark:text-neutral-600">
                {randomCharacters[0]}
              </span>
            )}
          </li>
          {tabs.map((tab, index) => (
            <li class="pl-2 w-full flex items-center justify-between">
              <a
                href={tab.path}
                class={
                  "underline-offset-2 hover:underline font-medium " +
                  (urlPathname === tab.path
                    ? ""
                    : "text-neutral-400 dark:text-neutral-500")
                }
              >
                {tab.name}
              </a>
              {urlPathname === tab.path ? (
                <span>{`${props.items.amount} ${props.items.label}`}</span>
              ) : (
                <span class="text-neutral-300 dark:text-neutral-600">
                  {randomCharacters[index + 1]}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div class="w-full lg:w-full bg-neutral-100 md:p-8 p-4 min-h-screen dark:bg-[#101010]">
        {props.children}
      </div>
    </section>
  )
}
