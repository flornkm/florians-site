"use client"

import { NextSeo } from "next-seo"
import Image from "next/image"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function Entry({ title, text, mainImage, date }) {
  const imgLoader = ({ src, width, quality }) => {
    return `/${src}?w=${width}&q=${quality || 75}`
  }

  return (
    <>
      <NextSeo
        title={title + " - Florian"}
        description="Read more about this journal entry."
        openGraph={{
          url: "floriandwt.com",
          title: title + " - Florian",
          description: "",
          images: [
            {
              url: "/images/florian_opengraph.jpg",
              width: 800,
              height: 600,
              alt: "Florian - Design Engineer",
              type: "image/jpeg",
            },
          ],
          siteName: "Florian - Design Engineer",
        }}
        twitter={{
          handle: "@floriandwt",
          site: "@floriandwt",
          cardType: "summary_large_image",
        }}
      />
      <Navigation title={title} highlight={"Entry"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-transparent dark:text-white relative">
        <div className="flex flex-col items-center justify-center h-full pt-24 max-md:pt-16 mb-6 w-full">
          <div className="max-w-2xl mb-12">
            <Image
              loader={imgLoader}
              src={mainImage}
              alt="Journal Cover"
              width={1920}
              height={500}
              className="mb-10 bg-zinc-50 dark:bg-[#09090b]"
            />
            <div className="flex gap-4 text-sm text-zinc-500 mb-2 font-mono">
              {date}
            </div>
            <h1 className="text-3xl font-semibold text-left mb-6">{title}</h1>
            {text}
            <div className="h-6"></div>
            <small className="text-zinc-500 mb-10">
              <time>2023</time> - All used images belong to their respective
              owners and are used for demonstration purposes only.
            </small>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
