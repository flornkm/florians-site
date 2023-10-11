import { PageContextCustom } from "../../renderer/types"
import { useIsVisible } from "../../interface/hooks/useIsVisible"
import { useEffect, useRef } from "preact/hooks"
import Button, { ButtonWrapper } from "../../interface/components/Button"
import Tooltip from "../../interface/components/Tooltip"
import Contact from "../../interface/components/Contact"

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
    <div class="min-h-screen w-full">
      <header class="flex items-center justify-start md:gap-24 gap-16 max-lg:pb-32 min-h-screen w-full lg:justify-between lg:flex-row flex-col-reverse">
        <div class="lg:h-2/6 h-2/5 max-lg:w-full max-lg:flex md:mb-24">
          <div class="cursor-text max-w-2xl">
            <h1 class="text-4xl font-semibold leading-snug pointer-events-none transition-colors group hover:text-zinc-400 mb-10">
              <span class="group-hover:underline text-zinc-400 underline-offset-4 selection:bg-blue-50 selection:text-blue-300">
                Florian.
              </span>{" "}
              A designer and developer building digital products.
            </h1>
            <ButtonWrapper>
              <Button style="primary" link="/#work">
                Work
              </Button>
              <Button style="secondary" link="/feed">
                Feed
              </Button>
            </ButtonWrapper>
          </div>
        </div>
      </header>
      <section class="w-full scroll-mt-24 mb-24" ref={work} id="work">
        <div class="flex gap-8 justify-between items-center mb-12">
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
        <div class="flex flex-col gap-24 pb-32">
          {/* {projects.map((project) => {
            const date = new Date(project.date)
            return (
              <a
                class="flex md:gap-16 gap-8 flex-col items-end md:flex-row group/project"
                href={project.url}
              >
                <div class="col-span-2">
                  <img src={project.cover} alt={project.title} />
                </div>
                <div class="md:w-72 w-full h-full flex-shrink-0 pr-4 md:opacity-60 transition-opacity group-hover/project:opacity-100 -mb-1">
                  <div class="text-zinc-400 group relative inline-block md:hover:text-black">
                    <p class="text-sm mb-3 transition-colors pt-3 inline-block">
                      {date.getFullYear()}{" "}
                      {
                        ["Q1", "Q2", "Q3", "Q4"][
                          Math.floor(date.getMonth() / 3)
                        ]
                      }{" "}
                      {date.getFullYear() !== new Date().getFullYear() &&
                        date.getFullYear() - new Date().getFullYear() + 1}
                      <Tooltip position="top">
                        <>{`${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`}</>
                      </Tooltip>
                    </p>
                  </div>
                  <div class="flex items-center gap-2 mb-2">
                    <img
                      src={project.icon}
                      class="w-6 h-6 transition-transform md:-rotate-3 group-hover/project:rotate-0"
                    />
                    <h3 class="text-lg font-semibold truncate flex-shrink-0">
                      {project.title}
                    </h3>
                    <div class="w-0 group-hover/project:w-full transition-all duration-500 h-[1px] bg-zinc-100 group-hover/project:bg-black ml-2 md:block hidden" />
                  </div>
                  <p class="text-zinc-500 line-clamp-2 transition-all mb-4">
                    {project.description}
                  </p>
                  <Button style="text" link="/feed">
                    Visit project
                  </Button>
                </div>
              </a>
            )
          })} */}
          {projects.map((project) => {
            const date = new Date(project.date)
            return (
              <div class="w-full">
                <div class="flex gap-4 flex-col md:flex-row items-start relative">
                  <img class="w-8 h-8 mt-2" src={project.icon} />
                  <div class="w-full">
                    <div class="flex gap-8 justify-between items-center mb-4 sticky top-0 lg:top-14 z-40 py-2">
                      <div class="w-full h-full absolute left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl" />
                      <div class="flex gap-3 items-center relative">
                        <h3 class="text-2xl font-semibold">{project.title}</h3>
                        <div class="group relative">
                          <p class="px-3 py-1 bg-zinc-100 text-zinc-500 text-sm rounded-full hidden md:block cursor-help transition-colors hover:bg-zinc-200 hover:text-zinc-600">
                            {date.getFullYear()}{" "}
                            {
                              ["Q1", "Q2", "Q3", "Q4"][
                                Math.floor(date.getMonth() / 3)
                              ]
                            }{" "}
                            {date.getFullYear() !== new Date().getFullYear() &&
                              date.getFullYear() - new Date().getFullYear() + 1}
                          </p>
                          <Tooltip position="bottom" class="translate-y-2">
                            <>{`${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`}</>
                          </Tooltip>
                        </div>
                      </div>
                      <Button style="text" link={project.url} class="relative">
                        Visit project
                      </Button>
                    </div>
                    <p class="mb-6 md:text-lg text-zinc-500">
                      {project.description}
                    </p>
                    <img src={project.cover} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
      <section class="w-full mb-64">
        <div>
          <Contact />
        </div>
      </section>
    </div>
  )
}
