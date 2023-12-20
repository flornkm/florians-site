import Button from "#components/Button"
import Folder from "~icons/eva/folder-outline"
import * as m from "#lang/paraglide/messages"
import README from "#components/README"

export default function Page() {
  return (
    <div class="w-full">
      <section class="w-full pb-24">
        <div class="flex items-center py-2 bg-light-zinc/95 backdrop-blur-xl dark:bg-black/90 sticky top-0 lg:top-14 z-50">
          <p class="font-medium px-1.5 text-zinc-400 dark:text-zinc-600 -ml-1.5">
            Archive
          </p>
        </div>
        <h1 class="text-3xl font-semibold mt-12 mb-6">{m.archive_title()}</h1>
        <div class="py-0.5 pb-8">
          <a
            href="/archive/projects"
            class="flex justify-between border-b border-b-zinc-100 dark:border-b-zinc-900 gap-4 leading-none md:items-center group/link py-4 transition-colors hover:bg-zinc-100 rounded-md dark:hover:bg-zinc-900"
          >
            <p class="font-medium leading-snug md:col-span-2 flex items-center">
              <Folder class="w-8 flex-shrink-0 text-zinc-400" />
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
            class="flex justify-between border-b border-b-zinc-100 dark:border-b-zinc-900 gap-4 leading-none md:items-center group/link py-4 transition-colors hover:bg-zinc-100 rounded-md dark:hover:bg-zinc-900"
          >
            <p class="font-medium leading-snug md:col-span-2 flex items-center">
              <Folder class="w-8 flex-shrink-0 text-zinc-400" />
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
          <a
            href="/archive/copyables"
            class="flex justify-between gap-4 leading-none md:items-center group/link py-4 transition-colors hover:bg-zinc-100 rounded-md dark:hover:bg-zinc-900"
          >
            <p class="font-medium leading-snug md:col-span-2 flex items-center">
              <Folder class="w-8 flex-shrink-0 text-zinc-400" />
              Copyables
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
        <README>
          <p class="text-zinc-500 max-w-lg dark:text-zinc-400">
            {m.archive_description()}
          </p>
        </README>
      </section>
    </div>
  )
}
