import Journal from "@/components/template/Entry"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Flos most favorite tools: May 2023 edition",
  description: "Here are my 3 most favourite tools in May 2023.",
}

export default function JounalEntry() {
  return (
    <>
      <Journal
        mainImage={
          "/images/entries/favorite-tools-may23/most_favourite_tools_may23.webp"
        }
        title={"Flos most favorite tools: May 2023 edition"}
        date={"2023-05-26"}
        text={
          <>
            <article className="text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Unavatar <br />
                <span className="text-gray-500 text-lg">
                  The ultimate Avatar API
                </span>
              </h3>
              <p className="mb-6">
                Unavatar is a service that allows you to retrieve avatars for
                your users from many different sources. It&apos;s a great way to
                add a personal touch to your app or website. The best part is,
                that you can access the images via a simple URL and that it is
                completely free to use.
              </p>
              <Link
                className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
                href="https://unavatar.io/#/"
                target="_blank"
              >
                Unavatar
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Screen Studio <br />
                <span className="text-gray-500 text-lg">
                  Simple recording software for stunning product demos
                </span>
              </h3>
              <p className="mb-6">
                Screen Studio is a screen recorder, that has features like
                zooming, highlighting, and much more built-in. The videos are
                looking high quality and I use it mainly for product demos. The
                software itself costs some money, but it&apos;s worth it in my
                opinion.
              </p>
              <Link
                className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
                href="https://www.screen.studio/"
                target="_blank"
              >
                Screen Studio
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Tailwind CSS <br />
                <span className="text-gray-500 text-lg">
                  Not really a tool, but I want to mention it anyways
                </span>
              </h3>
              <p className="mb-6">
                As you probably know, Tailwind CSS is a utility-first CSS
                framework. Nowadays I use it very often because it just saves me
                a lot of time. I also really like the Tailwind colors and their
                awesome community and documentation.
              </p>
              <Link
                className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
                href="https://tailwindcss.com/"
                target="_blank"
              >
                Tailwind CSS
              </Link>
              <div className="h-24"></div>
            </article>
          </>
        }
      />
    </>
  )
}
