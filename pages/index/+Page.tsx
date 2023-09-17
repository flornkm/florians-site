import { PageContextCustom } from "../../renderer/types"

export const documentProps = {
  title: "Florian - Design Engineer",
  description: "Florians Personal Website.",
} as PageContextCustom["documentProps"]

export const slug = "index"

export default function Page() {
  return (
    <div class="min-h-screen w-full">
      <header class="flex items-center h-screen w-full">
        <div class="h-2/6 max-w-2xl">
          <h1 class="text-4xl font-semibold leading-snug pointer-events-none transition-colors group hover:text-zinc-400">
            <a
              href="/about"
              class="text-zinc-400 pointer-events-auto group-hover:text-black"
            >
              Florian.
            </a>{" "}
            A designer and developer building digital products.
          </h1>
        </div>
      </header>
    </div>
  )
}
