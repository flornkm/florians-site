import Button from "#components/Button"
import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import Short from "~icons/eva/flash-fill"
import File from "~icons/eva/file-outline"
import Folder from "~icons/eva/folder-outline"
import * as m from "#lang/paraglide/messages"
import { useState } from "preact/hooks"

export default function Page({
  projects,
  currentFolder,
}: {
  currentFolder: "all" | "projects"
  projects: any
}) {
  return (
    <div class="w-full">
      <section class="w-full lg:pt-16">
        <h1 class="text-3xl font-semibold mb-4">{m.archive_title()}</h1>
        <p class="text-zinc-500 mb-16 max-w-lg dark:text-zinc-400">
          {m.archive_description()}
        </p>
        {currentFolder === "all" && (
          <div class="py-0.5 pb-16">
            <a
              href={"?folder=projects"}
              onClick={(e) => {
                e.preventDefault()
                window.history.pushState(
                  {},
                  "",
                  window.location.pathname + "?folder=projects"
                )
                window.dispatchEvent(new Event("popstate"))
              }}
              class="flex items-center justify-between gap-4 cursor-pointer leading-none md:items-center group/link py-4 transition-colors hover:bg-zinc-100 rounded-md"
            >
              <p class="font-semibold leading-snug md:col-span-2 flex items-center">
                <Folder class="w-8 flex-shrink-0" />
                Projects
              </p>
              <Button
                type="text"
                class="relative md:ml-auto col-span-2 md:col-span-1 group-hover/link:underline"
                chevron
              >
                {m.button_open()}
              </Button>
            </a>
            <div class="border-b border-b-zinc-100 dark:border-b-zinc-900" />
          </div>
        )}
        {currentFolder === "projects" && (
          <>
            <div class="md:hidden text-sm flex items-center gap-1 text-zinc-400 dark:text-zinc-500 mb-6">
              <Short class="w-4 pt-0.5 transition-colors text-zinc-300 dark:text-zinc-700" />
              <p>= Short case study</p>
            </div>
            <div class="py-0.5 pb-16">
              {projects.map((project: any) => {
                const date = new Date(
                  Number(project.date.split("/")[1]),
                  Number(project.date.split("/")[0])
                )
                return (
                  <>
                    <a
                      href={project.url}
                      class="grid md:grid-cols-9 grid-cols-2 gap-4 leading-none md:items-center group/link py-4 transition-colors hover:bg-zinc-100 rounded-md"
                    >
                      <p class="font-semibold leading-snug md:col-span-2 flex items-center">
                        <File class="w-8 flex-shrink-0" />
                        {project.title}
                      </p>
                      {project.short ? (
                        <div class="group relative md:place-self-start place-self-end">
                          <Short class="w-4 transition-colors text-zinc-300 lg:hover:text-amber-500 cursor-help dark:text-zinc-700" />
                          <Tooltip
                            position="top"
                            class="-translate-y-3 hidden md:block"
                          >
                            {m.short_case_study()}
                          </Tooltip>
                        </div>
                      ) : (
                        <p></p>
                      )}
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
          </>
        )}
      </section>
    </div>
  )
}
