import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import Content from "@/components/Content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Entries",
  description: "A overview of my entries.",
}

export default function Entries() {
  const entries = [
    {
      title: "Most favorite tools: July 2023 edition",
      description: "Here are my 3 most favourite tools in July 2023.",
      link: "/entries/most-favorite-tools-jul23",
      image:
        "/images/entries/favorite-tools-jul23/most_favourite_tools_jul23.webp",
    },
    {
      title: "Most favorite tools: June 2023 edition",
      description: "Here are my 3 most favourite tools in June 2023.",
      link: "/entries/most-favorite-tools-jun23",
      image:
        "/images/entries/favorite-tools-jun23/most_favourite_tools_jun23.webp",
    },
    {
      title: "Most favorite tools: May 2023 edition",
      description: "Here are my 3 most favourite tools in May 2023.",
      link: "/entries/most-favorite-tools-may23",
      image:
        "/images/entries/favorite-tools-may23/most_favourite_tools_may23.webp",
    },
    {
      title: "Most favorite tools: April 2023 edition",
      description: "Here are my 3 most favourite tools in April 2023.",
      link: "/entries/most-favorite-tools-apr23",
      image:
        "/images/entries/favorite-tools-apr23/most_favourite_tools_apr23.webp",
    },
    {
      title: "Most favorite tools: March 2023 edition",
      description: "Here are my 3 most favourite tools in March 2023.",
      link: "/entries/most-favorite-tools-mar23",
      image:
        "/images/entries/favorite-tools-mar23/most_favourite_tools_mar23.webp",
    },
    {
      title: "Most favorite tools: February 2023 edition",
      description: "Here are my 3 most favourite tools in February 2023.",
      link: "/entries/most-favorite-tools-feb23",
      image:
        "/images/entries/favorite-tools-feb23/most_favourite_tools_feb23.webp",
    },
    {
      title: "The Web in the future",
      description: "What will the internet look like in the future?",
      link: "/entries/webdesign-in-the-future",
      image:
        "/images/entries/webdesign_in_the_future/websites_in_the_future.webp",
    },
    {
      title: "Most favorite tools in 2022",
      description: "Here are my 8 most favourite tools in 2022.",
      link: "/entries/most-favorite-tools-2022",
      image: "/images/entries/favorite-tools/tools_i_use.webp",
    },
  ]

  return (
    <>
      <Navigation title={"Design Engineer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <Content entries={entries} />
      </main>
      <Footer />
    </>
  )
}
