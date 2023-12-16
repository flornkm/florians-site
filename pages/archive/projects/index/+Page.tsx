import Button, { InlineLink } from "#components/Button"
import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import File from "~icons/eva/file-outline"
import * as m from "#lang/paraglide/messages"
import README from "#components/README"

export default function Page({ projects }: { projects: any }) {
  return (
    <div class="w-full">
      <section class="w-full pb-24">
        <div class="flex items-center py-2  bg-light-zinc/95 backdrop-blur-xl dark:bg-black/90 sticky top-0 lg:top-14 z-50">
          <InlineLink link="/archive" class="px-1.5 -ml-1.5">
            Archive
          </InlineLink>
          <p> / </p>
          <p class="font-medium px-1.5 text-zinc-400 dark:text-zinc-600">
            Projects
          </p>
        </div>
        <h1 class="text-3xl font-semibold mt-12 mb-6">Projects</h1>
        <div class="py-0.5 pb-8">
          {projects.map((project: any) => {
            const date = new Date(
              Number(project.date.split("/")[1]),
              Number(project.date.split("/")[0])
            )
            return (
              <>
                <a
                  href={`${project.url}`}
                  class="grid md:grid-cols-8 grid-cols-2 gap-4 leading-none md:items-center group/link py-4 transition-colors hover:bg-zinc-100 rounded-md dark:hover:bg-zinc-900"
                >
                  <p class="font-medium leading-snug col-span-2 flex items-center">
                    <File class="w-8 flex-shrink-0 text-zinc-400" />
                    <span class="md:truncate">{project.title}</span>
                  </p>
                  <p class="text-zinc-500 truncate md:col-span-4 leading-snug col-span-2 dark:text-zinc-400">
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
                    class="relative md:ml-auto col-span-2 md:col-span-1 group-hover/link:underline"
                    chevron
                  >
                    {m.button_open()}
                  </Button>
                </a>
                {projects.indexOf(project) !== projects.length - 1 && (
                  <div class="border-b border-b-zinc-100 dark:border-b-zinc-900" />
                )}
              </>
            )
          })}
        </div>
        <README>
          <p class="text-zinc-500 max-w-lg dark:text-zinc-400">
            Projects are long-term projects that I've worked on. They're usually
            larger in scope and take a longer time to complete.
          </p>
        </README>
      </section>
    </div>
  )
}
