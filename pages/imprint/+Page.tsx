import * as m from "#lang/paraglide/messages"

export default function Page() {
  return (
    <div class="w-full">
      <section class="w-full relative min-h-screen flex flex-col max-w-nav mx-auto">
        <h1 class="text-2xl font-semibold mb-4">{m.imprint_title()}</h1>
        <p class="text-neutral-500 mb-8 dark:text-neutral-400">
          {m.imprint_text_first()}
        </p>
        <p class="mb-16 p-2 rounded-md bg-neutral-100 w-40 font-mono text-sm dark:bg-neutral-900">
          Florian Kiem <br />
          Fischerinsel 13 <br />
          10179 Berlin <br />
          Germany <br />
          <span class="text-xs mt-2 inline-flex text-neutral-500">
            (This address may be old)
          </span>
        </p>
        <p class="text-neutral-500 mb-16 dark:text-neutral-400">
          {m.imprint_text_second()}
        </p>
        <p class="text-neutral-500 dark:text-neutral-400">
          {m.imprint_text_third()}
        </p>
      </section>
    </div>
  )
}
