import Button, { ButtonWrapper } from "#components/Button"
import Star from "~icons/eva/star-fill"
import Island from "#components/Island"

export default function Page() {
  return (
    <div class="w-full">
      <section class="w-full lg:pt-16 relative min-h-screen">
        <h1 class="text-3xl font-semibold mb-16 w-full">Colophon</h1>
        <div class="flex gap-12 lg:flex-row flex-col mb-24"></div>
        <Island
          link="https://github.com/flornkm/florians-site"
          icon={<Star class="text-yellow-500" />}
        >
          <p>
            Star on GitHub{" "}
            <span class="text-zinc-300 dark:text-zinc-700">|</span>{" "}
            <span class="text-zinc-400 text-sm dark:text-zinc-500">
              Find my open-source repository on GitHub.
            </span>
          </p>
        </Island>
      </section>
    </div>
  )
}
