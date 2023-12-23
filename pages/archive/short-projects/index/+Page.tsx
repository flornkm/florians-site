import Button, { InlineLink } from "#components/Button"
import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import { TextFile as File } from "#design-system/Icons"
import * as m from "#lang/paraglide/messages"
import README from "#components/README"
import { userScrolledDown } from "#hooks/userScrolledDown"

export default function Page({ projects }: { projects: any }) {
  return (
    <div class="w-full">
      <section class="w-full pb-24">
        <div
          class={
            "flex items-center lg:mt-6 mb-6 bg-light-zinc/95 backdrop-blur-xl dark:bg-black/90 sticky top-0 lg:top-14 z-50 transition-all " +
            (userScrolledDown(40)
              ? "font-medium py-2"
              : "text-3xl font-semibold lg:py-2")
          }
        >
          <InlineLink link="/archive" class="px-1.5 -ml-1.5" hideWeight>
            Archive
          </InlineLink>

          <p> / </p>
          <p class="px-1.5 text-zinc-400 dark:text-zinc-600 truncate">
            Short Projects
          </p>
        </div>
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
                    <File class="w-5 flex-shrink-0 text-zinc-400 mr-2" />
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
            Short projects have a shorter case study and are usually smaller in
            scope.
          </p>
        </README>
      </section>
    </div>
  )
}
