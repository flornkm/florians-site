import Journal from "@/components/template/Entry"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Flos most favorite tools: June 2023 edition",
  description: "Here are my 3 most favourite tools in June 2023.",
}

export default function JounalEntry() {
  return (
    <>
      <Journal
        mainImage={
          "/images/entries/favorite-tools-jun23/most_favourite_tools_jun23.webp"
        }
        title={"Flos most favorite tools: June 2023 edition"}
        date={"2023-06-29"}
        text={
          <>
            <article className="text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Cron <br />
                <span className="text-gray-500 text-lg">Business Calendar</span>
              </h3>
              <p className="mb-6">
                Let&apos;s begin with Cron. It is a simple, yet powerful
                calendar that I use to schedule and maintain appointments,
                lectures and other events. It is really easy to use and has all
                the necessary features I need to organize my day.
              </p>
              <Link
                className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
                href="https://cron.com/"
                target="_blank"
              >
                Cron
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                GitHub <br />
                <span className="text-gray-500 text-lg">
                  Use it for more, than just a hub for Git!
                </span>
              </h3>
              <p className="mb-6">
                To be honest, as a design-development hybrid (and not just a
                software developer), I never thought GitHub has other usable
                features than just being… a hub for Git, especially for smaller
                teams. I knew about issues, but not in this detail. Managing
                your repo with GitHub issues is a great way to keep track of
                your work and collaborate with your team. Definitely worth a
                try!
              </p>
              <Link
                className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
                href="https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues"
                target="_blank"
              >
                GitHub Issues
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Missive <br />
                <span className="text-gray-500 text-lg">
                  A great, simple mail client for teams
                </span>
              </h3>
              <p className="mb-6">
                I&apos;ve also learned about Missive from working at{" "}
                <Link
                  href="https://inlang.com/"
                  target="_blank"
                  className="inner-link"
                >
                  inlang
                </Link>
                . Missive is a great mail client for teams. It is very easy to
                use and has a lot of great features. I especially like the fact
                that you can assign mails to other people and that you can
                easily see who is working on what.
              </p>
              <Link
                className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
                href="https://missiveapp.com/"
                target="_blank"
              >
                Missive
              </Link>
              <div className="h-24"></div>
            </article>
          </>
        }
      />
    </>
  )
}
