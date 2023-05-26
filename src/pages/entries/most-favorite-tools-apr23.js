import Journal from "@/components/Entry";
import Link from "next/link";

export default function JounalEntry() {
  return (
    <>
      <Journal
        mainImage={
          "images/entries/favorite-tools-apr23/most_favourite_tools_apr23.webp"
        }
        title={"Flos most favorite tools: April 2023 edition"}
        date={"2023-04-26"}
        text={
          <>
            <article className="text-gray-700 dark:text-gray-300">
            <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Raycast AI <br /><span className="text-gray-500 text-lg">Use ChatGPT directly in Raycast</span>
              </h3>
              <p className="mb-6">
              If you're looking to boost your productivity, Raycast is an excellent tool that I've already written about. Recently, they released a new feature called Raycast AI, which enables you to utilize ChatGPT directly within Raycast. This is an incredibly efficient way to use AI without the need to open a new application or tab.
              </p>
              <Link
                className="dflt-button dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600"
                href="https://www.raycast.com/ai"
                target="_blank"
              >
                Raycast AI
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Arc Mobile <br /><span className="text-gray-500 text-lg">Simple yet advanced browser</span>
              </h3>
              <p className="mb-6">
              I've been an Arc user on my Mac for quite some time, and I'm thrilled to see that they've launched a mobile version. It's a sleek browser with an attractive design, and it also includes some impressive features, particularly for tab management.
              </p>
              <Link
                className="dflt-button dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600"
                href="https://apps.apple.com/us/app/arc-mobile-companion/id1669785846"
                target="_blank"
              >
                Arc Mobile
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                Vercel <br /><span className="text-gray-500 text-lg">The platform for Frontend Developers</span>
              </h3>
              <p className="mb-6">
              You're probably already familiar with Vercel, but I wanted to give it a quick shoutout since I've been using it extensively myself. Throughout April, I relied heavily on Vercel for deploying my projects.
              </p>
              <Link
                className="dflt-button dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600"
                href="https://vercel.com/"
                target="_blank"
              >
                Vercel
              </Link>
              <div className="h-24"></div>
            </article>
          </>
        }
      />
    </>
  );
}
