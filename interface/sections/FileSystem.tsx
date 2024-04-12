import { JSX } from "preact/jsx-runtime"
import { usePageContext } from "../../renderer/usePageContext"
import Vectorfiles from "../../pages/archive/copyables/assets/vectorfiles.json"
import { InlineLink } from "#components/Button"

// TODO: Auto fill the amount of items in each tab
export const tabs = [
  {
    name: "Projects",
    path: "/archive/projects",
    items: {
      amount: 2,
      label: "projects",
    },
  },
  {
    name: "Short Projects",
    path: "/archive/short-projects",
    items: {
      amount: 6,
      label: "projects",
    },
  },
  {
    name: "Copyables",
    path: "/archive/copyables",
    items: {
      amount: Vectorfiles.length,
      label: "copyables",
    },
  },
  {
    name: "Photos",
    path: "/archive/photos",
    items: {
      amount: 10,
      label: "photos",
    },
  },
  {
    name: "Posts",
    path: "/archive/posts",
    items: {
      amount: 13,
      label: "posts",
    },
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
    <section class="w-full flex flex-col lg:flex-row lg:py-4 md:mb-4 mb-12">
      {tabs.find((tab) => tab.path === urlPathname) ? (
        <div class="flex items-center mb-4 py-2 sticky top-0 lg:top-14 z-50 lg:hidden bg-light-neutral/95 backdrop-blur-xl dark:bg-black/90">
          <div class="flex relative">
            <InlineLink link="/archive" class="px-1.5 -ml-1.5">
              Archive
            </InlineLink>
            {tabs.find((tab) => tab.path === urlPathname) && <p> / </p>}
            <p class="font-medium px-1.5 text-neutral-400 dark:text-neutral-600 truncate">
              {tabs.find((tab) => tab.path === urlPathname)?.name}
            </p>
          </div>
        </div>
      ) : (
        <div class="h-4" />
      )}
      <div class="lg:max-w-[calc((100%-432px)/2)] w-full mb-4 md:mb-8 h-full">
        <h1 class="text-2xl line-clamp-2 mb-6 text-neutral-400 selection:bg-blue-50 selection:text-blue-300 dark:text-neutral-500 dark:selection:bg-blue-950 dark:selection:text-blue-500 font-semibold leading-snug transition-colors group hover:text-neutral-400">
          Archive
        </h1>
        <ul class="sticky top-24 mb-8 lg:mb-0 hidden lg:block w-full lg:pr-8">
          <li class="w-full flex items-center justify-between">
            <a
              href="/archive"
              class={
                "underline-offset-2 font-medium group w-full flex items-center justify-between py-1 " +
                (urlPathname === "/archive"
                  ? ""
                  : "text-neutral-400 dark:text-neutral-500")
              }
            >
              <span class="group-hover:underline ">Archive</span>
              <span
                class={
                  "no-underline " +
                  (urlPathname === "/archive"
                    ? "text-black dark:text-white"
                    : "text-neutral-300 dark:text-neutral-600")
                }
              >
                {tabs.length} categories
              </span>
            </a>
          </li>
          {tabs.map((tab, index) => (
            <li key={index}>
              <a
                href={tab.path}
                class={
                  "underline-offset-2 font-medium group pl-2 w-full flex items-center justify-between py-1 " +
                  (urlPathname === tab.path
                    ? ""
                    : "text-neutral-400 dark:text-neutral-500")
                }
              >
                <span class="group-hover:underline ">{tab.name}</span>
                <span
                  class={
                    "no-underline " +
                    (urlPathname === tab.path
                      ? "text-black dark:text-white"
                      : "text-neutral-300 dark:text-neutral-600")
                  }
                >
                  {`${tab.items.amount} ${tab.items.label}`}
                </span>
              </a>
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
