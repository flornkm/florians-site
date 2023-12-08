import Button from "#components/Button"
import Folder from "~icons/eva/folder-fill"
import * as m from "#lang/paraglide/messages"

export default function Page() {
  return (
    <div class="w-full">
      <section class="w-full lg:pt-16">
        <h1 class="text-3xl font-semibold mb-4">{m.archive_title()}</h1>
        <p class="text-zinc-500 mb-16 max-w-lg dark:text-zinc-400">
          {m.archive_description()}
        </p>
        <div class="py-0.5 pb-16">
          <a
            href="/archive/projects"
            class="flex justify-between border-b border-b-zinc-100 dark:border-b-zinc-900 gap-4 leading-none md:items-center group/link py-4 transition-colors hover:bg-zinc-100 rounded-md"
          >
            <p class="font-semibold leading-snug md:col-span-2 flex items-center">
              <Folder class="w-8 flex-shrink-0" />
              Projects
            </p>
            <Button
              type="text"
              link="/archive/projects"
              class="relative md:ml-auto col-span-2 md:col-span-1 group-hover/link:underline"
              chevron
            >
              {m.button_open()}
            </Button>
          </a>
          <a
            href="/archive/short-projects"
            class="flex justify-between gap-4 leading-none md:items-center group/link py-4 transition-colors hover:bg-zinc-100 rounded-md"
          >
            <p class="font-semibold leading-snug md:col-span-2 flex items-center">
              <Folder class="w-8 flex-shrink-0" />
              Short Projects
            </p>
            <Button
              type="text"
              link="/archive/projects"
              class="relative md:ml-auto col-span-2 md:col-span-1 group-hover/link:underline"
              chevron
            >
              {m.button_open()}
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
