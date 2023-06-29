import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Transition } from '@headlessui/react'

export default function Journal() {
  const [hoveredImg, setHoveredImg] = useState(null);
  const [imgShow, setImgShow] = useState(false);
  const outerSticky = useRef(null);
  const reference = useRef(null);

  // make the height of the outerSticky as high as the reference
  useEffect(() => {
    if (typeof window !== "undefined") {
      outerSticky.current.style.height = reference.current.offsetHeight - 400 + "px";
    }
  }, []);

  const entries = [
    {
      title: "Most favorite tools: June 2023 edition",
      description: "Here are my 3 most favourite tools in June 2023.",
      link: "/entries/most-favorite-tools-jun23",
      image: "/images/entries/favorite-tools-jun23/most_favourite_tools_jun23.webp",
    },
    {
      title: "Most favorite tools: May 2023 edition",
      description: "Here are my 3 most favourite tools in May 2023.",
      link: "/entries/most-favorite-tools-may23",
      image: "/images/entries/favorite-tools-may23/most_favourite_tools_may23.webp",
    },
    {
      title: "Most favorite tools: April 2023 edition",
      description: "Here are my 3 most favourite tools in April 2023.",
      link: "/entries/most-favorite-tools-apr23",
      image: "/images/entries/favorite-tools-apr23/most_favourite_tools_apr23.webp",
    },
    {
      title: "Most favorite tools: March 2023 edition",
      description: "Here are my 3 most favourite tools in March 2023.",
      link: "/entries/most-favorite-tools-mar23",
      image: "/images/entries/favorite-tools-mar23/most_favourite_tools_mar23.webp",
    },
    {
      title: "Most favorite tools: February 2023 edition",
      description: "Here are my 3 most favourite tools in February 2023.",
      link: "/entries/most-favorite-tools-feb23",
      image: "/images/entries/favorite-tools-feb23/most_favourite_tools_feb23.webp",
    },
    {
      title: "The Web in the future",
      description: "What will the internet look like in the future?",
      link: "/entries/webdesign-in-the-future",
      image: "/images/entries/webdesign_in_the_future/websites_in_the_future.webp",
    },
    {
      title: "Most favorite tools in 2022",
      description: "Here are my 8 most favourite tools in 2022.",
      link: "/entries/most-favorite-tools-2022",
      image: "/images/entries/favorite-tools/tools_i_use.webp",
    }
  ];

  return (
    <>
      <NextSeo
        title="Entries - Florian"
        description="A little journal about my life as a designer and developer and more."
        openGraph={{
          url: 'floriandwt.com',
          title: 'Entries - Florian',
          description: 'A little journal about my life as a designer and developer and more.',
          images: [
            {
              url: '/images/florian_opengraph.jpg',
              width: 800,
              height: 600,
              alt: 'Florian - Design Engineer',
              type: 'image/jpeg',
            }
          ],
          siteName: 'Florian - Design Engineer',
        }}
        twitter={{
          handle: '@floriandwt',
          site: '@floriandwt',
          cardType: 'summary_large_image',
        }}
      />
      <Navigation title={"Design Engineer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <div className="flex gap-4 justify-between max-md:flex-col pt-8 h-full min-h-screen relative">
          <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 pb-16 md:pr-12">
            <h1 className="text-3xl font-semibold text-left mb-3">Entries</h1>
            <h2 className="text-xl text-left text-zinc-500 dark:text-zinc-400">
              Here you can find my thoughts, ideas and more I want to share with
              the world wide web.
            </h2>
            <div className="relative mt-12 max-md:hidden" ref={outerSticky}>
              <Transition
                show={imgShow}
                enter="transition-opacity duration-75"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                as="div"
                className="w-full sticky top-56"
              >
                <Image priority src={hoveredImg} width={800} height={500} />
              </Transition>
            </div>
          </div>
          <div className="flex flex-col items-start gap-8 md:pt-32 md:pl-12 pb-24 md:min-w-[450px]" ref={reference}>
            {entries.map((entry) => (
              <Link
                href={entry.link}
                onMouseOver={() => {
                  setImgShow(true)
                  setHoveredImg(entry.image)
                }}
                onMouseLeave={() => {
                  setImgShow(false)
                }}
                className="cursor-pointer flex flex-col justify-start transition-all hover:bg-zinc-100 px-4 py-3 rounded-lg text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 relative -left-4"
              >
                <h3 className="text-lg font-medium text-ellipsis transition-all text-black dark:text-white">
                  {entry.title}
                </h3>
                <p className="text-ellipsis transition-all text-zinc-500 dark:text-zinc-400">{entry.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
