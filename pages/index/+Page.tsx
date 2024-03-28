import Letters from "#sections/Letters"
import Work from "#sections/Work"
import * as m from "#lang/paraglide/messages"
import Waitlist from "#components/Waitlist"

export default function Page({ projects }: { projects: any[] }) {
  return (
    <div class="w-full">
      <header class="w-full flex gap-4 flex-col lg:items-end lg:flex-row py-4 md:mb-8">
        <div class="lg:w-1/3 mb-4 md:mb-0">
          <h1 class="text-2xl line-clamp-2 text-neutral-400 selection:bg-blue-50 selection:text-blue-300 dark:text-neutral-500 dark:selection:bg-blue-950 dark:selection:text-blue-500 font-semibold leading-snug transition-colors group hover:text-neutral-400">
            Designer and Developer <br />
            <span class="text-black">Florian</span>
          </h1>
        </div>
        <div class="max-w-nav w-full lg:mx-auto">
          <h2 class="md:text-2xl text-xl font-semibold">{m.work_title()}</h2>
        </div>
        <div class="w-1/3 hidden lg:block" />
      </header>
      <section class="w-full scroll-mt-24 mb-12" id="work">
        <Work projects={projects} />
      </section>
      <section class="w-full">
        <Letters />
      </section>
      <section class="w-full relative h-full mb-24 lg:mb-0">
        <div class="2xl:w-[99vw] md:w-[98vw] w-[97vw] overflow-hidden relative left-1/2 -translate-x-1/2 inset-0 py-16 bg-neutral-100 dark:bg-neutral-950 h-full border-y dark:lg:border-b-0 border-y-neutral-200 dark:border-neutral-900 cta-gradient">
          <div class="w-full relative max-w-screen-lx mx-auto md:px-10 px-12 z-10">
            <h2 class="text-xl font-semibold leading-snug mb-4">
              {m.waitlist_heading()}
            </h2>
            <p class="mb-6 text-neutral-500 dark:text-neutral-400">
              {m.waitlist_description()}
            </p>
            <Waitlist />
          </div>
        </div>
      </section>
    </div>
  )
}
