import Navigation from "@/components/interface/Navigation"
import Footer from "@/components/interface/Footer"
import Content from "@/components/client/EntriesOverview"
import { allEntries } from "contentlayer/generated"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Entries",
  description: "A overview of my entries.",
}

const entries = allEntries.sort((a, b) => {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
})

export default function Entries() {
  return (
    <>
      <Navigation title="Entries" />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <Content entries={entries} />
      </main>
      <Footer />
    </>
  )
}
