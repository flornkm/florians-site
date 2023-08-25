"use client"

import { useRef, useState, useEffect } from "react"
import { useIsVisible } from "@/hooks/useIsVisible"
import Contact from "./Contact"
import Projects from "./ProjectsOverview"
import copy from "copy-to-clipboard"
import * as Icon from "react-feather"

/**
 * This file contains different combinations of components
 */
export function ProjectsContact(props: any) {
  const [mailText, setMailText] = useState(["Florian", "Click to copy"])
  const [mailActive, setMailActive] = useState(false)
  const projects = useRef(null)
  const contact = useRef(null)
  const projectsVisible = useIsVisible(projects)
  const contactVisible = useIsVisible(contact)

  useEffect(() => {
    if (projectsVisible) {
      props.setHighlight("Work")
    } else {
      props.setHighlight("Home")
    }
    if (contactVisible) {
      setMailActive(true)
    } else {
      setMailActive(false)
    }
  }, [projectsVisible, contactVisible, props])

  const copyMail = () => {
    copy("florian.kiem@hfg.design")
    setMailText(["Copied!", "Copied to clipboard"])
    setTimeout(() => {
      setMailText(["Florian", "Click to copy"])
    }, 2000)
  }

  return (
    <>
      <div>
        <div className="flex justify-between pb-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            Some of my selected work
          </h2>
        </div>
        <div ref={projects} id="work">
          <Projects />
        </div>
      </div>
      <div className="h-64"></div>
      <div
        className={
          (mailActive
            ? "fixed right-0 bottom-8 z-40 pointer-events-none pr-[10%] opacity-100 max-md:hidden"
            : "opacity-0 pr-[10%] bottom-0") +
          " transition-all duration-300 max-md:hidden"
        }
      >
        <div className="max-w-6xl flex justify-end w-full">
          <div
            onClick={copyMail}
            className="pr-4 pl-4 pt-3 pb-3 group z-10 pointer-events-auto bg-white hover:bg-zinc-100 hover:scale-[0.99] shadow-lg dark:hover:bg-zinc-900 transition-all rounded-lg backdrop-blur-xl ring-1 ring-zinc-200 cursor-pointer flex gap-8 justify-between place-items-center dark:bg-[#09090b] dark:ring-zinc-800 dark:hover:ring-[#212126]"
          >
            <div className="flex flex-col">
              <p className="font-semibold group-hover:hidden">{mailText[0]}</p>
              <p className="font-semibold hidden group-hover:block">
                {mailText[1]}
              </p>
              <p>florian.kiem@hfg.design</p>
            </div>
            <Icon.Mail width={24} />
          </div>
        </div>
      </div>
      <div ref={contact} id="contact">
        <Contact />
      </div>
    </>
  )
}
