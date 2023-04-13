import Head from "next/head";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Journal() {
  const entries = [
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
      <Head>
        <title>Journal | Design With Tech</title>
        <meta
          name="description"
          content="Designer and Developer building digital products."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Combining Design and Technology | Design With Tech"
        />
        <meta
          property="og:description"
          content="Designer and Developer building digital products."
        />
        <meta
          property="og:image"
          content="/images/designwithtech_opengraph.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@floriandwt" />
        <meta name="twitter:title" content="Florian Portfolio" />
        <meta
          name="twitter:image"
          content="/images/designwithtech_twitter.jpg"
        />
        <meta
          name="twitter:description"
          content="Designer and Developer building digital products."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
              className="cursor-pointer flex flex-col justify-start transition-all hover:bg-zinc-100 px-4 py-3 rounded-lg text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 relative -left-4"
            >
              <h3 className="text-xl font-medium text-left mb-2">
                {entry.title}
              </h3>
              <p className="text-left">{entry.description}</p>
            </Link>
          ))}
        </div>
        <div className="h-64"></div>
      </main>
      <Footer />
    </>
  );
}
