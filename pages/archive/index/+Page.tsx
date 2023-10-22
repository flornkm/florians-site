import { ComponentChild, VNode } from "preact"
import Button from "../../../interface/components/Button"
import { InlineInfo } from "../../../interface/components/Inline"
import Tooltip from "../../../interface/components/Tooltip"
import Short from "~icons/eva/flash-fill"

export const documentProps = {
  title: "Florian's Archive",
}

export default function Page({ projects }: { projects: any }) {
  return (
    <div class="w-full">
      <section class="w-full lg:pt-16">
        <h1 class="text-3xl font-semibold mb-4">Archive</h1>
        <p class="text-zinc-500 mb-16 max-w-lg">
          In my archive, you will find smaller creations, MVPs, ideas and
          results from hackathons. Feel free to look through if you are
          interested.
        </p>
        <div class="py-0.5 pb-16">
          {projects.map((project: any) => {
            const date = new Date(
              Number(project.date.split("/")[1]),
              Number(project.date.split("/")[0])
            )
            return (
              <>
                <div class="grid md:grid-cols-8 grid-cols-2 gap-4 leading-none md:items-center">
                  <p class="font-medium leading-snug flex items-center">
                    {project.title}
                  </p>
                  {project.short ? (
                    <div class="group relative md:place-self-start place-self-end">
                      <Short class="w-4 pt-0.5 transition-colors text-zinc-300 hover:text-lime-500 cursor-help" />
                      <Tooltip position="top" class="-translate-y-3">
                        Short case study
                      </Tooltip>
                    </div>
                  ) : (
                    <p></p>
                  )}
                  <p class="text-zinc-500 truncate md:col-span-4 leading-snug col-span-2">
                    {project.description}
                  </p>
                  <div class="group relative mr-auto md:col-span-1 col-span-2 mb-4 md:mb-0">
                    <p class="text-sm">
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
                    <Tooltip position="top" class="-translate-y-3">
                      <>{project.date}</>
                    </Tooltip>
                  </div>
                  <Button
                    type="text"
                    link={project.url}
                    class="relative md:ml-auto col-span-2 md:col-span-1"
                    chevron
                  >
                    Open
                  </Button>
                </div>
                {projects.indexOf(project) !== projects.length - 1 && (
                  <div class="border-b border-b-zinc-100 my-4" />
                )}
              </>
            )
          })}
        </div>
      </section>
    </div>
  )
}
