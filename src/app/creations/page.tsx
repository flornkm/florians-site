"use client"

import * as React from "react"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import CreationGrid from "@/components/CreationGrid"

export default function Creations() {
  return (
    <>
      <Navigation title="Design Engineer" highlight="Creations" />
      <main className="max-md:w-[90%] min-h-[100vh] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <CreationGrid />
      </main>
      <Footer />
    </>
  )
}
