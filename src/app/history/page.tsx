"use client"

import { NextSeo } from "next-seo"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function History() {
  const versions = [
    {
      version: "4",
      date: "Q2 2023",
      changes: ["Redesigned completely", "Recoded everything"],
    },
    {
      version: "3",
      date: "Q3 2022",
      changes: ["Reordered content", "Reduction in distraction"],
    },
    {
      version: "2",
      date: "Q1 2022",
      changes: ["Better explanation", "Showcasing my skills", "Widgets"],
    },
    {
      version: "1",
      date: "Q3 2020",
      changes: ["Initial release", "Added freelance work"],
    },
  ] as {
    version: string
    date: string
    changes: string[]
  }[]

  return (
    <>
      <NextSeo
        title="History - Florian"
        description="Florians Website History."
        openGraph={{
          url: "floriandwt.com",
          title: "History - Florian",
          description: "Florians Website History.",
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
      <Navigation title={"Design Engineer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16">
          <h1 className="text-3xl font-semibold text-left mb-3">History</h1>
          <p className="text-base mb-24">
            Here you find the history of this website.
          </p>
          {/* <h2 className="text-xl font-medium mb-8">General</h2> */}
          <div className="flex flex-col gap-8 max-md:gap-12">
            {versions.map((version) => (
              <div
                key={versions.indexOf(version)}
                className={
                  "flex w-full justify-between items-center gap-1 max-md:flex-col-reverse max-md:items-start " +
                  (version.version !== "1" &&
                    "border-b border-dashed border-zinc-100 pb-8 dark:border-solid dark:border-zinc-800")
                }
              >
                <div>
                  <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
                    {version.version === "4" ? (
                      <div className="h-1 animate-ping w-1 rounded-full bg-primary" />
                    ) : (
                      ""
                    )}{" "}
                    Version {version.version}
                  </h2>
                  <div className="flex items-center flex-wrap">
                    {version.changes.map((change) => (
                      <p
                        key={version.changes.indexOf(change)}
                        className="text-sm text-zinc-500 dark:text-zinc-400"
                      >
                        {change}
                        {version.changes.indexOf(change) !==
                          version.changes.length - 1 && (
                          <span className="mx-1">-</span>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                    {version.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:h-32 max-md:h-24"></div>
      </main>
      <Footer />
    </>
  )
}
