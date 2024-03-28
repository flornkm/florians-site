import Button from "#components/Button"
import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import * as m from "#lang/paraglide/messages"

export default function Work(props: { projects: Record<string, string>[] }) {
  return (
    <>
      <div class="flex flex-col gap-8">
        {props.projects.map((project) => {
          const date = new Date(
            Number(project.date.split("/")[1]),
            Number(project.date.split("/")[0])
          )
          return (
            <div class="w-full group/project mb-8 md:mb-0">
              <a
                class="flex md:gap-0 gap-2 flex-col lg:flex lg:flex-row items-start relative group/link"
                href={project.url}
              >
                <div class="w-full lg:max-w-[calc((100%-450px)/2)] sticky top-20 md:pr-8">
                  <h3 class="text-lg font-semibold group-hover:text-neutral-400 transition-colors md:group-hover/link:underline underline-offset-2">
                    {project.title}
                  </h3>
                  <p class="text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <div class="w-full relative">
                  <div class="bg-neutral-100 dark:bg-neutral-900/70 overflow-hidden lg:h-auto flex items-center justify-center w-full md:px-8">
                    <img
                      class="relative md:h-auto md:object-scale-down md:object-center object-cover object-left"
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
