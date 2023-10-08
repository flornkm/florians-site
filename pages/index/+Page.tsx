import { PageContextCustom } from "../../renderer/types"
import { useIsVisible } from "../../interface/hooks/useIsVisible"
import { useEffect, useRef } from "preact/hooks"
import Button, { ButtonWrapper } from "../../interface/components/Button"

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
        <div class="lg:h-2/6 h-2/5 max-lg:w-full max-lg:flex">
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
      <section class="w-full scroll-mt-24" ref={work} id="work">
        <div class="flex gap-8 justify-between items-center mb-16">
          <h2
            class="text-2xl text-zinc-400 font-semibold flex-shrink-0 transition-colors duration-700"
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
          {projects.map((project) => {
            const date = new Date(project.date)
            return (
              <a
                class="flex md:gap-16 gap-8 flex-col items-end md:flex-row group border border-transparent md:hover:border-zinc-200 bg-white transition-colors"
                href={project.url}
              >
                <div class="col-span-2">
                  <img src={project.cover} alt={project.title} />
                </div>
                <div class="md:w-72 w-full h-full flex-shrink-0 pr-4 md:opacity-60 transition-opacity group-hover:opacity-100">
                  <p class="text-zinc-400 text-sm mb-3">
                    {date.getFullYear()}{" "}
                    {["Q1", "Q2", "Q3", "Q4"][Math.floor(date.getMonth() / 3)]}{" "}
                    {date.getFullYear() !== new Date().getFullYear() &&
                      date.getFullYear() - new Date().getFullYear() + 1}
                  </p>
                  <div class="flex items-center gap-2 mb-2">
                    <img
                      src={project.icon}
                      class="w-6 h-6 transition-transform md:-rotate-6 group-hover:rotate-0 duration-500"
                    />
                    <h3 class="text-lg font-semibold truncate flex-shrink-0">
                      {project.title}
                    </h3>
                  </div>
                  <p class="text-zinc-500 line-clamp-2 -mb-1.5 md:group-hover:mb-10 transition-all">
                    {project.description}
                  </p>
                </div>
              </a>
            )
          })}
        </div>
      </section>
    </div>
  )
}
