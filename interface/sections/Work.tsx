import Button from "#components/Button"
import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import { Ref } from "preact"
import * as m from "#lang/paraglide/messages"

export default function Work(props: { projects: Record<string, string>[] }) {
  return (
    <>
      <div class="flex flex-col gap-32">
        {props.projects.map((project) => {
          const date = new Date(
            Number(project.date.split("/")[1]),
            Number(project.date.split("/")[0])
          )
          return (
            <div class="w-full group/project">
              <a
                class="flex lg:gap-4 gap-2 flex-col md:flex-row items-start relative group/link"
                href={project.url}
              >
                <div class="lg:sticky lg:top-14 py-2 flex-shrink-0 top-0">
                  <img
                    alt={`
                    Icon of ${project.title} project
                  `}
                    class="w-8 h-8 outline-1 -outline-offset-1 outline outline-transparent rounded-lg dark:outline-zinc-900"
                    src={project.icon}
                  />
                </div>
                <div class="w-full">
                  <div class="flex gap-4 md:gap-8 justify-between items-center sticky top-0 lg:top-14 z-40 py-2">
                    <div class="w-full h-full absolute left-1/2 -translate-x-1/2 bg-light-zinc/95 backdrop-blur-xl dark:bg-black/90" />
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
                        <Tooltip position="bottom" class="translate-y-3">
                          <>{project.date}</>
                        </Tooltip>
                      </div>
                    </div>
                    <Button
                      type="text"
                      link={project.url}
                      class="relative group-hover/link:underline"
                      chevron
                    >
                      {m.button_readmore()}
                    </Button>
                  </div>
                  <p class="mb-6 text-zinc-500 dark:text-zinc-400">
                    {project.description}
                  </p>
                  <div class="bg-zinc-100 dark:bg-zinc-900/70 overflow-hidden lg:h-[512px] flex items-center justify-center">
                    <img
                      class="relative lg:top-8 md:left-0 md:h-auto h-96 md:object-scale-down md:object-center object-cover object-left md:px-12 pl-4"
                      src={project.cover}
                      alt={project.title}
                    />
                  </div>
                </div>
              </a>
            </div>
          )
        })}
      </div>
    </>
  )
}
