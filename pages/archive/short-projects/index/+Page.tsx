import Button from "#components/Button"
import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import File from "~icons/eva/file-outline"
import Folder from "~icons/eva/folder-outline"
import * as m from "#lang/paraglide/messages"
import README from "#components/README"

export default function Page({ projects }: { projects: any }) {
  return (
    <div class="w-full">
      <section class="w-full lg:pt-16">
        <div class="py-0.5 pb-8">
          <a
            href="/archive"
            class="flex justify-between gap-4 border-b border-b-zinc-100 dark:border-b-zinc-900 leading-none md:items-center group/link py-4 transition-colors hover:bg-zinc-100 rounded-md dark:hover:bg-zinc-900"
          >
            <p class="font-semibold leading-snug md:col-span-2 flex items-center">
              <Folder class="w-8 flex-shrink-0 text-zinc-400" />
              Archive / Short Projects
            </p>
            <Button
              type="text"
              link="/archive"
              class="relative md:ml-auto col-span-2 md:col-span-1 group-hover/link:underline truncate"
              chevron
            >
              {m.button_go_up()}
            </Button>
          </a>
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
                  <p class="font-semibold leading-snug col-span-2 flex items-center md:pl-5">
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
          <>
            <h1 class="text-3xl font-semibold mb-4">Short Projects</h1>
            <p class="text-zinc-500 max-w-lg dark:text-zinc-400">
              Short projects have a shorter case study and are usually smaller
              in scope.
            </p>
          </>
        </README>
      </section>
    </div>
  )
}
