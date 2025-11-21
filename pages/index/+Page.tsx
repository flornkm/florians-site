import Letters from "#sections/Letters"
import Work from "#sections/Work"
import * as m from "#lang/paraglide/messages"
import Waitlist from "#components/Waitlist"
import { AiSwitch } from "#components/Navigation"

export default function Page({ projects }: { projects: any[] }) {
  return (
    <>
      {/* Skip to content: visible on keyboard focus, hidden otherwise */}
      <a
        href="#content"
        class="fixed left-3 top-3 -translate-y-20 focus-visible:translate-y-0 z-50 px-3 py-2 rounded-md bg-neutral-900 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:bg-white dark:text-neutral-900 dark:focus-visible:ring-neutral-400"
      >
        Skip to content
      </a>

      <main id="content" class="w-full" role="main">
        <header class="w-full pb-4 md:mb-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Name + Role */}
            <div class="flex items-start justify-between gap-4 lg:justify-start">
              <h1 class="text-2xl font-semibold leading-snug text-neutral-500 dark:text-neutral-400 selection:bg-blue-50 selection:text-blue-300 dark:selection:bg-blue-950 dark:selection:text-blue-500">
                <span class="block">{m.designer_developer()}</span>
                <span class="block text-black dark:text-white">Florian</span>
              </h1>
              {/* Mobile theme/AI toggle keeps a generous hit target */}
              <div class="mt-1 lg:hidden xs:mb-0 mb-1 touch-manipulation">
                <AiSwitch />
              </div>
            </div>

            {/* Section title centered on large screens for better hierarchy */}
            <div class="max-w-nav w-full lg:mx-auto">
              <h2 id="work-heading" class="md:text-2xl text-xl font-semibold">
                {m.work_title()}
              </h2>
            </div>

            {/* Right spacer keeps title optically centered on wide layouts */}
            <div class="hidden lg:block" aria-hidden="true" />
          </div>
        </header>

        <section class="w-full scroll-mt-24 mb-12" id="work" aria-labelledby="work-heading">
          <Work projects={projects} />
        </section>

        <section class="w-full bg-neutral-100 dark:bg-[#101010] mb-12">
          {/* Provide an accessible name for the letters section without adding visual noise */}
          <h2 class="sr-only">Letters</h2>
          <Letters />
        </section>

        <section class="w-full overflow-hidden">
          <div class="w-full relative py-12 md:py-16">
            <div class="relative mx-auto w-full max-w-screen-md z-10">
              <div class="max-w-2xl mb-6">
                <h2 class="text-xl font-semibold leading-snug mb-3 md:mb-4">
                  {m.waitlist_heading()}
                </h2>
                <p class="text-neutral-500 dark:text-neutral-400">
                  {m.waitlist_description()}
                </p>
              </div>

              {/* Subtle card to improve scannability without changing content */}
              <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 supports-[backdrop-filter]:dark:bg-neutral-900/40 p-4 md:p-5">
                <Waitlist />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
