import Navigation from "@/components/interface/Navigation"
import Footer from "@/components/interface/Footer"
import ColophonOverview from "@/components/client/ColophonOverview"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Colophon",
  description: "Colophon of this website.",
}

export default function Colophon() {
  return (
    <>
      <Navigation title={"Design Engineer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16">
          <ColophonOverview />
        </div>
        <div className="md:h-32 max-md:h-24"></div>
      </main>
      <Footer />
    </>
  )
}
