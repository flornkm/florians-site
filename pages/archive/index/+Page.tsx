import { ComponentChild, VNode } from "preact"
import Button from "../../../interface/components/Button"
import { InlineInfo } from "../../../interface/components/Inline"
import Tooltip from "../../../interface/components/Tooltip"

export const documentProps = {
  title: "Florian's Archive",
}

export default function Page({ projects }: { projects: any }) {
  return (
    <div class="w-full">
      <section class="w-full lg:pt-16 pt-8">
        <h1 class="text-3xl font-semibold mb-4">Archive</h1>
        <p class="text-zinc-500 mb-16 max-w-lg">
          In my archive, you will find smaller creations, MVPs, ideas and
          results from hackathons. Feel free to look through if you are
          interested.
        </p>
        <div class="py-0.5">
          {projects.map((project: any) => {
            const date = new Date(
              Number(project.date.split("/")[1]),
              Number(project.date.split("/")[0])
            )
            return (
              <>
                <div class="md:grid md:grid-cols-7 flex flex-col gap-4 leading-none md:items-center">
                  <p class="font-medium leading-snug">{project.title}</p>
                  <p class="text-zinc-500 truncate md:col-span-4 leading-snug">
                    {project.description}
                  </p>
                  <div class="group relative mr-auto">
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
                    <Tooltip position="top" class="-translate-y-2">
                      <>{project.date}</>
                    </Tooltip>
                  </div>
                  <Button
                    type="text"
                    link={project.url}
                    class="relative md:ml-auto"
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
