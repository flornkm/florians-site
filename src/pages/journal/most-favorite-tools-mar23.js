import Journal from "@/components/Journal";
import Link from "next/link";

export default function JounalEntry() {
  return (
    <>
      <Journal
        mainImage={
          "images/journal/favorite-tools-mar23/most_favorite_tools_mar23.webp"
        }
        title={"Flos most favorite tools: March 2023 edition"}
        date={"2023-03-26"}
        text={
          <>
            <article className="text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">
                Posts <br /><span className="text-gray-500 text-lg">Twitter, but for designers and developers</span>
              </h3>
              <p className="mb-6">
                Post is a mobile application made from the team behind ReadCV.
                It is a platform that's built for designers and developers to
                share their work, photos and thoughts. It has a very clean and
                simple interface that's designed to focues on the content.
              </p>
              <Link
                className="bg-white text-black pr-4 pl-4 pt-2 pb-2 rounded-md hover:bg-gray-100 transition-all font-medium border border-solid border-gray-300 dark:bg-transparent dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                href="https://testflight.apple.com/join/Pv0Sn7OT"
                target="_blank"
              >
                Posts on Testflight
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-10">
                Revolut <br /><span className="text-gray-500 text-lg">Intelligent, easy to use banking app</span>
              </h3>
              <p className="mb-6">
                While I don't use Revolut as my main bank or trading app, I
                use it for managing my money when I am studying. The app lets
                you easily view insights, round up your purchases and manage
                your money in a very easy way.
              </p>
              <Link
                className="bg-white text-black pr-4 pl-4 pt-2 pb-2 rounded-md hover:bg-gray-100 transition-all font-medium border border-solid border-gray-300 dark:bg-transparent dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                href="https://www.revolut.com/"
                target="_blank"
              >
                Revolut
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-10">
                Fig <br /><span className="text-gray-500 text-lg">Terminal with superpowers</span>
              </h3>
              <p className="mb-6">
                Fig is no application, it is more like an addition to your
                terminal. It extends the terminal with a lot of useful features
                like autocomplete, which is very useful for working more
                efficiently. You can install it via Homebrew and it has a
                free plan.
              </p>
              <Link
                className="bg-white text-black pr-4 pl-4 pt-2 pb-2 rounded-md hover:bg-gray-100 transition-all font-medium border border-solid border-gray-300 dark:bg-transparent dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                href="https://fig.io/"
                target="_blank"
              >
                Fig
              </Link>
              <div className="h-10"></div>
            </article>
          </>
        }
      />
    </>
  );
}
