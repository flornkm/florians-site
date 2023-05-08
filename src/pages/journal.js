import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Journal() {
  const entries = [
    {
      title: "Most favorite tools: April 2023 edition",
      description: "Here are my 3 most favourite tools in April 2023.",
      link: "/journal/most-favorite-tools-apr23",
    },
    {
      title: "Most favorite tools: March 2023 edition",
      description: "Here are my 3 most favourite tools in March 2023.",
      link: "/journal/most-favorite-tools-mar23",
    },
    {
      title: "Most favorite tools: February 2023 edition",
      description: "Here are my 3 most favourite tools in February 2023.",
      link: "/journal/most-favorite-tools-feb23",
    },
    {
      title: "The Web in the future",
      description: "What will the internet look like in the future?",
      link: "/journal/webdesign-in-the-future",
    },
    {
      title: "Most favorite tools in 2022",
      description: "Here are my 8 most favourite tools in 2022.",
      link: "/journal/most-favorite-tools-2022",
    },
  ];

  return (
    <>
      <NextSeo
        title="Journal - Florian"
        description="A little journal about my life as a designer and developer and more."
        openGraph={{
          url: 'floriandwt.com',
          title: 'Journal - Florian',
          description: 'A little journal about my life as a designer and developer and more.',
          images: [
            {
              url: '/images/designwithtech_opengraph.jpg',
              width: 800,
              height: 600,
              alt: 'Florian - Digtital Product Designer',
              type: 'image/jpeg',
            }
          ],
          siteName: 'Florian - Digtital Product Designer',
        }}
        twitter={{
          handle: '@floriandwt',
          site: '@floriandwt',
          cardType: 'summary_large_image',
        }}
      />
      <Navigation title={"Designer and Developer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-[#101012] dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 mb-16">
          <h1 className="text-3xl font-semibold text-left mb-3">Journal</h1>
          <h2 className="text-xl font-medium text-left text-zinc-500 dark:text-zinc-400">
            Thoughts and more.
          </h2>
        </div>
        <div className="flex flex-col items-start gap-8">
          {entries.map((entry) => (
            <Link
              href={entry.link}
              className="cursor-pointer flex flex-col justify-start transition-all hover:bg-zinc-100 px-4 py-3 rounded-lg text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 relative -left-4"
            >
              <h3 className="text-lg font-medium text-ellipsis transition-all text-black dark:text-white">
                {entry.title}
              </h3>
              <p className="text-ellipsis transition-all text-zinc-500 dark:text-zinc-400">{entry.description}</p>
            </Link>
          ))}
        </div>
        <div className="h-64"></div>
      </main>
      <Footer />
    </>
  );
}
