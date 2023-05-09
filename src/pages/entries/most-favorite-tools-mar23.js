import Journal from "@/components/Entry";
import Link from "next/link";

export default function JounalEntry() {
  return (
    <>
      <Journal
        mainImage={
          "images/entries/favorite-tools-mar23/most_favorite_tools_mar23.webp"
        }
        title={"Flos most favorite tools: March 2023 edition"}
        date={"2023-03-26"}
        text={
          <>
            <article className="text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Posts <br /><span className="text-gray-500 text-lg">Twitter, but for designers and developers</span>
              </h3>
              <p className="mb-6">
                Posts is a mobile application made from the team behind ReadCV.
                It is a platform that's built for designers and developers to
                share their work, photos and thoughts.
              </p>
              <Link
                className="dflt-button dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600"
                href="https://testflight.apple.com/join/Pv0Sn7OT"
                target="_blank"
              >
                Posts on Testflight
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Revolut <br /><span className="text-gray-500 text-lg">Intelligent, easy to use banking app</span>
              </h3>
              <p className="mb-6">
                While I don't use Revolut as my main bank or trading app, I
                use it for managing my money while I am studying. The app lets
                you easily view insights, round up your purchases and manage
                your money in a very easy way.
              </p>
              <Link
                className="dflt-button dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600"
                href="https://www.revolut.com/"
                target="_blank"
              >
                Revolut
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Fig <br /><span className="text-gray-500 text-lg">Terminal with superpowers</span>
              </h3>
              <p className="mb-6">
                Fig is no extra application, it is more like an addition to your
                terminal. It extends the terminal with a lot of useful features
                like autocomplete, which is very useful for working more
                efficiently. You can install it via Homebrew and it has a
                free plan.
              </p>
              <Link
                className="dflt-button dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600"
                href="https://fig.io/"
                target="_blank"
              >
                Fig
              </Link>
              <div className="h-24"></div>
            </article>
          </>
        }
      />
    </>
  );
}
