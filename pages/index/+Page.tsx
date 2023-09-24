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
      <header class="flex items-center justify-start md:gap-24 gap-16 h-screen w-full lg:justify-between lg:flex-row flex-col-reverse">
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
        <div class="flex flex-col gap-16 pb-32">
          {projects.map((project) => (
            <a
              class="flex gap-16 flex-col items-end md:flex-row md:hover:bg-zinc-50 group transition-colors"
              href={project.url}
            >
              <div class="col-span-2 bg-zinc-50">
                <img src={project.image} alt={project.title} />
              </div>
              <div class="md:w-72 w-full h-full flex-shrink-0 pr-4 opacity-60 transition-opacity group-hover:opacity-100">
                <h3 class="text-lg font-semibold truncate flex-shrink-0 mb-2">
                  {project.title}
                </h3>
                <p class="text-zinc-500 line-clamp-2 -mb-1 md:group-hover:mb-10 transition-all">
                  {project.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
