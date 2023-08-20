import Navigation from "@/components/interface/Navigation"
import Footer from "@/components/interface/Footer"
import Timeline from "@/components/client/TimelineContent"
import PersonalGrid from "@/components/client/CardGrid"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "A collection of my creations.",
}

export default function About() {
  return (
    <>
      <Navigation title="About" highlight="About" />
      <main className="max-md:w-[90%] min-h-[100vh] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <div className="h-40 max-md:h-24" />
        <Timeline />
        <div className="h-32" />
        <PersonalGrid />
        <div className="h-32"></div>
      </main>
      <Footer />
    </>
  )
}
