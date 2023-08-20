import Journal from "@/components/template/Entry"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Flos most favorite tools: Jule 2023 edition",
  description: "Here are my 3 most favourite tools in Jule 2023.",
}

export default function JounalEntry() {
  return (
    <>
      <Journal
        mainImage={
          "/images/entries/favorite-tools-jul23/most_favourite_tools_jul23.webp"
        }
        title={"Flos most favorite tools: Jule 2023 edition"}
        date={"2023-07-31"}
        text={
          <>
            <article className="text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Retro <br />
                <span className="text-gray-500 text-lg">
                  A mix between BeReal and Instagram
                </span>
              </h3>
              <p className="mb-6">
                Retro is a social media platform allowing you to post imagery
                based on the weeks of the year. While I don&apos;t think the
                world needs another social media app, I find it quite refreshing
                to use something new to share what I&apos;m doing on some days.
                Some other things I like the app for are, that they have a very
                nice UI and that inviting friends is easy. Looking forward to
                seeing how the app is being maintained in the future.
              </p>
              <Link
                className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
                href="https://www.retro.app/"
                target="_blank"
              >
                Retro
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                NordPass <br />
                <span className="text-gray-500 text-lg">
                  A free and simple password manager
                </span>
              </h3>
              <p className="mb-6">
                Every password has to be different. One rule that I find somehow
                important when creating new accounts on different platforms.
                That, it comes that you can&apos;t remember all passwords and
                need a password manager. I would wish the native Apple solution
                was more flexible in terms of Browser support and syncing, but
                sadly right now it&apos;s not yet at the point I would like to
                use it mainly. Because my old password manager wasn&apos;t
                supported anymore by ARM-based devices, I had to search for
                another solution and found NordPass. I like their design,
                it&apos;s free to use and they have a good extension – I&apos;m
                happy with it.
              </p>
              <Link
                className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
                href="https://nordpass.com/"
                target="_blank"
              >
                NordPass
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                TicketSwap <br />
                <span className="text-gray-500 text-lg">
                  A fast way to sell tickets for events you won&apos;t attend
                </span>
              </h3>
              <p className="mb-6">
                At the end of the month, I wanted to go to a concert-like event
                with some friends. I couldn&apos;t attend it sadly so I had to
                sell my ticket for it. Instead of eBay or similar platforms,
                I&apos;ve used TicketSwap for it. While they might have fees on
                their platform, I found the User Experience when creating the
                offer extremely well made. In no time I was able to offer my
                ticket, saw transparently how much I get back from it, and the
                ticket sold after a few hours.
              </p>
              <Link
                className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
                href="https://www.ticketswap.com/"
                target="_blank"
              >
                TicketSwap
              </Link>
              <div className="h-24"></div>
            </article>
          </>
        }
      />
    </>
  )
}
