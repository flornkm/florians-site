import Button from "#components/Button"
import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import { Ref } from "preact"

export default function Work(props: {
  projects: Record<string, string>[]
  workStroke?: Ref<HTMLDivElement>
  workTitle?: Ref<HTMLHeadingElement>
}) {
  return (
    <>
      {props.workStroke && props.workTitle && (
        <>
          <div class="flex gap-8 justify-between items-center mb-4">
            <h2
              class="text-3xl text-zinc-400 font-semibold flex-shrink-0 transition-colors duration-700"
              ref={props.workTitle}
            >
              Selected work
            </h2>
            <div class="w-full relative flex items-center">
              <div class="h-[1px] bg-zinc-100 absolute w-full" />
              <div
                class="h-[1px] bg-black absolute z-10 transition-all duration-700"
                style={{ width: "100%" }}
                ref={props.workStroke}
              />
            </div>
          </div>
          <p class="mb-20 text-zinc-500 text-lg">
            Things I have worked on in my career. Includes all employment,
            freelance and study work.
          </p>
        </>
      )}
      <div class="flex flex-col gap-32 mb-56">
        {props.projects.map((project) => {
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
                        <Tooltip position="bottom" class="translate-y-3">
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
                      Read more
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
    </>
  )
}
