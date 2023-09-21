import { PageContextCustom } from "../../renderer/types"
import { useIsVisible } from "../../interface/hooks/useIsVisible"
import { useEffect, useRef } from "preact/hooks"
import Brush from "~icons/eva/brush-fill"
import File from "~icons/eva/file-text-fill"
import Checkmark from "~icons/eva/checkmark-square-2-fill"

export const documentProps = {
  title: "Florian - Design Engineer",
  description: "Florians Personal Website.",
} as PageContextCustom["documentProps"]

export const slug = "index"

export default function Page() {
  const { work, workStroke, workTitle } = {
    work: useRef<HTMLDivElement>(null),
    workStroke: useRef<HTMLDivElement>(null),
    workTitle: useRef<HTMLHeadingElement>(null),
  }

  const workVisible = useIsVisible(work)

  useEffect(() => {
    if (workStroke.current && workTitle.current) {
      if (workVisible) {
        setTimeout(() => {
          workStroke.current.style.width = "0%"
          workTitle.current.style.color = "black"
        }, 100)
      }
    }
  }, [workVisible, workStroke, workTitle])

  return (
    <div class="min-h-screen w-full">
      <header class="flex items-center justify-start md:gap-24 gap-16 h-screen w-full lg:justify-between lg:flex-row flex-col-reverse">
        <div class="lg:h-2/6 h-2/5 max-lg:w-full max-lg:flex">
          <div class="cursor-text max-w-2xl">
            <h1 class="text-4xl font-semibold leading-snug pointer-events-none transition-colors group hover:text-zinc-400">
              <a
                href="/about"
                class="text-zinc-400 pointer-events-auto group-hover:text-black transition-all duration-200"
              >
                <span class="group-hover:underline underline-offset-4 ">
                  Florian
                </span>
                .
              </a>{" "}
              A designer and developer building digital products.
            </h1>
          </div>
        </div>
      </header>
      <section class="w-full max-w-xl lg:max-w-4xl lg:mx-auto h-96">
        <p class="text-zinc-500 lg:text-center cursor-text">
          As a
          <span class="text-emerald-500 selection:bg-emerald-100 selection:text-emerald-500">
            <Brush class="inline-block h-6 w-6 bg-emerald-100 p-0.5 ml-1.5 rounded-lg" />{" "}
            designer
          </span>{" "}
          and
          <span class="text-sky-500 selection:bg-sky-100 selection:text-sky-500">
            <File class="inline-block h-6 w-6 bg-sky-100 p-0.5 mx-1.5 rounded-lg" />
            developer
          </span>
          , I see my role in leading projects that help companies to achieve
          their ambitious goals of creating something functionally and
          technologically{" "}
          <span class="text-purple-500 selection:bg-purple-100 selection:text-purple-500 relative">
            <Particles />
            <Checkmark class="inline-block h-6 w-6 bg-purple-100 p-0.5 mr-1 rounded-lg" />
            useful
          </span>{" "}
          for humanity.
        </p>
      </section>
      <section class="w-full" ref={work} id="work">
        <div class="flex gap-8 justify-between items-center">
          <h2
            class="text-2xl text-zinc-400 font-semibold flex-shrink-0 transition-colors duration-700"
            ref={workTitle}
          >
            Selected work
          </h2>
          <div class="w-full relative flex items-center">
            <div class="h-[1px] bg-zinc-100 absolute w-full" />
            <div
              class="h-[1px] bg-black absolute z-10 transition-all duration-700"
              style={{ width: "100%" }}
              ref={workStroke}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function Particles() {
  // returns particles flying a little bit from bottom to top
  return (
    <div class="absolute bottom-0 left-0 w-full h-full pointer-events-none">
      <div
        style={{
          left: Math.random() * 100 + "%",
        }}
        class="absolute w-1 h-1 bg-purple-400 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-particle-bottom-top"
      />
      <div
        style={{
          left: Math.random() * 100 + "%",
        }}
        class="absolute w-1 h-1 bg-purple-400 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-particle-bottom-top-slow"
      />
      <div
        style={{
          left: Math.random() * 100 + "%",
        }}
        class="absolute w-1 h-1 bg-purple-400 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-particle-bottom-top"
      />
    </div>
  )
}
