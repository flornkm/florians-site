import { PageContextCustom } from "../../renderer/types"
import { useIsVisible } from "../../interface/hooks/useIsVisible"
import { useEffect, useRef } from "preact/hooks"
import Button, { ButtonWrapper } from "../../interface/components/Button"
import Tooltip from "../../interface/components/Tooltip"
import Contact from "../../interface/components/Contact"
import { InlineInfo } from "../../interface/components/Inline"

export const documentProps = {
  title: "Florian - Design Engineer",
  description: "Florians Personal Website.",
} as PageContextCustom["documentProps"]

export const slug = "index"

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
          workTitle.current.style.color = "black"
        }, 100)
      }
    }
  }, [workVisible, workStroke, workTitle])

  return (
    <div class="w-full">
      <header class="flex items-center justify-start md:gap-24 gap-16 max-lg:pb-32 min-h-screen w-full lg:justify-between lg:flex-row flex-col-reverse">
        <div class="lg:h-2/6 h-2/5 max-lg:w-full max-lg:flex mb-24">
          <div class="cursor-text max-w-2xl">
            <h1 class="text-4xl font-semibold leading-snug pointer-events-none transition-colors group hover:text-zinc-400 mb-10">
              <span class="group-hover:underline text-zinc-400 underline-offset-4 selection:bg-blue-50 selection:text-blue-300">
                Florian.
              </span>{" "}
              A designer and developer building digital products.
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
                Work
              </Button>
              <Button type="secondary" link="/about">
                About
              </Button>
            </ButtonWrapper>
          </div>
        </div>
      </header>
      <section class="w-full scroll-mt-24 mb-24" ref={work} id="work">
        <div class="flex gap-8 justify-between items-center mb-4">
          <h2
            class="text-3xl text-zinc-400 font-semibold flex-shrink-0 transition-colors duration-700"
            ref={workTitle}
          >
            Selected work
          </h2>
          <div class="w-full relative flex items-center">
            <div class="h-[1px] bg-zinc-100 absolute w-full" />
            <div
              class="h-[1px] bg-black absolute z-10 transition-all duration-700"
              style={{ width: "100%" }}
              ref={workStroke}
            />
          </div>
        </div>
        <p class="mb-20 text-zinc-500 text-lg">
          Things I have worked on in my career. Includes all employment,
          freelance and study work.
        </p>
        <div class="flex flex-col gap-32 mb-56">
          {projects.map((project) => {
            const date = new Date(
              Number(project.date.split("/")[1]),
              Number(project.date.split("/")[0])
            )
            return (
              <div class="w-full group/project">
                <div class="flex lg:gap-4 gap-2 flex-col md:flex-row items-start relative">
                  <div class="lg:py-2 lg:sticky top-14 flex-shrink-0">
                    <img class="w-8 h-8" src={project.icon} />
                  </div>
                  <div class="w-full">
                    <div class="flex gap-8 justify-between items-center sticky top-0 lg:top-14 z-40 py-2">
                      <div class="w-full h-full absolute left-1/2 -translate-x-1/2 bg-light-zinc/95 backdrop-blur-xl" />
                      <div class="flex md:gap-3 gap-2 items-center relative">
                        <h3 class="text-2xl font-semibold">{project.title}</h3>
                        <div class="group relative">
                          <p class="text-sm truncate hidden md:block">
                            <InlineInfo>
                              <>
                                {date.getFullYear().toString()}{" "}
                                {
                                  ["Q1", "Q2", "Q3", "Q4"][
                                    Math.floor(date.getMonth() / 3)
                                  ]
                                }
                              </>
                            </InlineInfo>
                          </p>
                          <Tooltip position="bottom" class="translate-y-2">
                            <>{project.date}</>
                          </Tooltip>
                        </div>
                      </div>
                      <Button
                        type="text"
                        link={project.url}
                        class="relative"
                        chevron
                      >
                        Visit project
                      </Button>
                    </div>
                    <p class="mb-6 text-zinc-500">{project.description}</p>
                    <img src={project.cover} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
      <section class="w-full mb-32">
        <div>
          <Contact />
        </div>
      </section>
    </div>
  )
}
