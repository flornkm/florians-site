import Letters from "#sections/Letters"
import Work from "#sections/Work"
import * as m from "#lang/paraglide/messages"
import Waitlist from "#components/Waitlist"
import { AiSwitch } from "#components/Navigation"

export default function Page({ projects }: { projects: any[] }) {
  return (
    <div class="w-full">
      <header class="w-full flex gap-4 flex-col lg:items-end lg:flex-row py-4 md:mb-8">
        <div class="lg:w-1/3 mb-4 md:mb-0 w-full flex flex-col-reverse xs:flex-row justify-between gap-4">
          <h1 class="text-2xl line-clamp-3 text-neutral-400 selection:bg-blue-50 selection:text-blue-300 dark:text-neutral-500 dark:selection:bg-blue-950 dark:selection:text-blue-500 font-semibold leading-snug">
            Designer and Developer <br />
            <span class="text-black dark:text-white">Florian</span>
          </h1>
          <div class="mt-2 lg:hidden xs:mb-0 mb-4">
            <AiSwitch />
          </div>
        </div>
        <div class="max-w-nav w-full lg:mx-auto">
          <h2 class="md:text-2xl text-xl font-semibold">{m.work_title()}</h2>
        </div>
        <div class="w-1/3 hidden lg:block" />
      </header>
      <section class="w-full scroll-mt-24 mb-12" id="work">
        <Work projects={projects} />
      </section>
      <section class="w-full bg-neutral-100 mb-12 dark:bg-[#101010]">
        <Letters />
      </section>
      <section class="w-full flex items-center md:flex-row flex-col overflow-hidden">
        <div class="w-full relative h-full mb-24 lg:mb-0 py-16">
          <div class="w-full relative max-w-screen-md mx-auto z-10">
            <div class="max-w-4xl">
              <h2 class="text-xl font-semibold leading-snug mb-4">
                {m.waitlist_heading()}
              </h2>
              <p class="mb-6 text-neutral-500 dark:text-neutral-400">
                {m.waitlist_description()}
              </p>
            </div>
            <Waitlist />
          </div>
        </div>
      </section>
    </div>
  )
}
