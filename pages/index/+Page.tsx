import Letters from "#sections/Letters"
import Work from "#sections/Work"
import * as m from "#lang/paraglide/messages"

export default function Page({ projects }: { projects: any[] }) {
  return (
    <div class="w-full">
      <header class="flex items-center justify-start md:gap-24 gap-16 max-lg:pb-32 w-full py-32 mb-12 lg:justify-between lg:flex-row flex-col-reverse">
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
      {/* <section class="w-full">
        <Contact />
      </section> */}
      <section class="w-full">
        <Letters />
      </section>
    </div>
  )
}
