import Letters from "#sections/Letters"
import Work from "#sections/Work"
import * as m from "#lang/paraglide/messages"
import Waitlist from "#components/Waitlist"

export default function Page({ projects }: { projects: any[] }) {
  return (
    <div class="w-full">
      <header class="flex items-center justify-start md:gap-24 gap-16 max-lg:py-20 w-full lg:pt-24 lg:pb-8 mb-12 lg:justify-between lg:flex-row flex-col-reverse">
        <div class="lg:h-2/6 h-2/5 max-lg:w-full max-lg:flex">
          <div class="cursor-text max-w-2xl">
            <h1 class="text-4xl font-semibold leading-snug pointer-events-none transition-colors group hover:text-zinc-400 mb-10">
              <span class="group-hover:underline text-zinc-400 underline-offset-4 selection:bg-blue-50 selection:text-blue-300 dark:text-zinc-500 dark:selection:bg-blue-950 dark:selection:text-blue-500">
                Florian.
              </span>{" "}
              {m.main_header_description()}
            </h1>
          </div>
        </div>
      </header>
      <section class="w-full scroll-mt-24 mb-12" id="work">
        <Work projects={projects} />
      </section>
      <section class="w-full">
        <Letters />
      </section>
      <section class="w-full relative h-full mb-24 lg:mb-0">
        <div class="2xl:w-[99vw] md:w-[98vw] w-[97vw] overflow-hidden relative left-1/2 -translate-x-1/2 inset-0 py-16 bg-zinc-100 dark:bg-zinc-950 h-full border-y dark:lg:border-b-0 border-y-zinc-200 dark:border-zinc-900 cta-gradient">
          <div class="w-full relative max-w-screen-lx mx-auto md:px-10 px-12 z-10">
            <h2 class="text-xl font-semibold leading-snug mb-4">
              Join my personal waitlist
            </h2>
            <p class="mb-6 text-zinc-500 dark:text-zinc-400">
              I'm currently working on a new project and and want to inform
              you first when it's ready. I therefore created this personal
              waitlist. I will never spam you and will only update you when I
              have something really useful to share.
            </p>
            <Waitlist />
          </div>
        </div>
      </section>
    </div>
  )
}
