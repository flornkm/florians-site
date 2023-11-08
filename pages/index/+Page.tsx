import { useIsVisible } from "#hooks/useIsVisible"
import { useEffect, useRef } from "preact/hooks"
import Button, { ButtonWrapper } from "#components/Button"
import Contact from "#sections/Contact"
import Letters from "#sections/Letters"
import Work from "#sections/Work"
import { changeTitleColor } from "../../interface/helper/lightOrDarkChanges"
import * as m from "@inlang/paraglide-js/florians-site/messages"

export default function Page({ projects }: { projects: any[] }) {
  const { work, workStroke, workTitle } = {
    work: useRef<HTMLDivElement>(null),
    workStroke: useRef<HTMLDivElement>(null),
    workTitle: useRef<HTMLHeadingElement>(null),
  }

  const workVisible = useIsVisible(work)

  useEffect(() => {
    if (workStroke.current && workTitle.current) {
      if (workVisible) {
        setTimeout(() => {
          // @ts-ignore
          workStroke.current.style.width = "0%"
          // @ts-ignore
          if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ) {
            // @ts-ignore
            workTitle.current.style.color = "white"
          } else {
            // @ts-ignore
            workTitle.current.style.color = "black"
          }

          if (workTitle.current) changeTitleColor(workTitle.current)
        }, 100)
      }
    }
  }, [workVisible, workStroke, workTitle])

  return (
    <div class="w-full">
      <header class="flex items-center justify-start md:gap-24 gap-16 max-lg:pb-32 min-h-screen w-full lg:justify-between lg:flex-row flex-col-reverse">
        <div class="lg:h-2/6 h-2/5 max-lg:w-full max-lg:flex mb-40">
          <div class="cursor-text max-w-2xl">
            <h1 class="text-4xl font-semibold leading-snug pointer-events-none transition-colors group hover:text-zinc-400 mb-10">
              <span class="group-hover:underline text-zinc-400 underline-offset-4 selection:bg-blue-50 selection:text-blue-300 dark:text-zinc-500 dark:selection:bg-blue-950 dark:selection:text-blue-500">
                Florian.
              </span>{" "}
              {m.mainheadingdescription()}
            </h1>
            <ButtonWrapper>
              <Button
                type="primary"
                function={() => {
                  typeof window !== undefined &&
                    scrollTo({
                      top: work.current!.offsetTop - 24,
                      behavior: "smooth",
                    })
                }}
              >
                {m.mainheadingprimarybutton()}
              </Button>
              <Button type="secondary" link="/about">
                {m.mainheadingsecondarybutton()}
              </Button>
            </ButtonWrapper>
          </div>
        </div>
      </header>
      <section class="w-full scroll-mt-24 mb-24" ref={work} id="work">
        <Work
          projects={projects}
          workStroke={workStroke}
          workTitle={workTitle}
        />
      </section>
      <section class="w-full">
        <Contact />
      </section>
      <section class="w-full">
        <Letters />
      </section>
    </div>
  )
}
