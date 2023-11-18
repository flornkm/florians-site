import { InlineLink } from "#components/Button"
import Star from "~icons/eva/star-fill"
import Island from "#components/Island"
import hljs from "highlight.js"
import { useEffect } from "preact/hooks"
import Slider from "#components/Slider"
import Tooltip from "#components/Tooltip"

export default function Page() {
  useEffect(() => {
    hljs.highlightAll()

    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches

    const syntaxHighlightingCSS = prefersDarkMode
      ? import("highlight.js/styles/github-dark.css")
      : import("highlight.js/styles/github.css")

    syntaxHighlightingCSS.then((module) => {
      module.default
    })
  })

  return (
    <div class="w-full">
      <section class="w-full lg:pt-16 relative min-h-screen flex flex-col">
        <h1 class="text-3xl font-semibold mb-4 w-full order-2 md:order-1">
          Colophon
        </h1>
        <p class="text-zinc-500 mb-16 max-w-lg dark:text-zinc-400 order-3 md:order-2">
          Every detail about my personal site, collected on one page.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-6 md:items-start order-4 md:order-3 pb-32">
          <p class="font-semibold leading-snug flex items-center">Typography</p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              For the typography on this website I've used{" "}
              <InlineLink link="https://github.com/orioncactus/pretendard">
                Pretendard Variable
              </InlineLink>
              , which was made with the influence of the Inter typeface and
              Apple SF Pro.
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-medium leading-snug flex items-center">Iconography</p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              My icons are from{" "}
              <InlineLink link="https://github.com/akveo/eva-icons">
                Eva Icons
              </InlineLink>
              , offering both solid and outlined icons resulting in flexible
              usage based on size and surroundings I used them in.
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">
            Photography
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              Most of my photos where made from friends, colleagues or myself.
              Credits to{" "}
              <InlineLink link="https://www.alicesopp.com/">
                Alice Sopp
              </InlineLink>
              ,{" "}
              <InlineLink link="https://www.marcrufeis.de/">
                Marc Rufeis
              </InlineLink>
              , and{" "}
              <InlineLink link="https://www.nilseller.com/">
                Nils Eller
              </InlineLink>
              .
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">Mockups</p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              The mockups I've used are from the{" "}
              <InlineLink link="https://artboard.studio/">
                Artboard Studio
              </InlineLink>{" "}
              Figma plugin.
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">
            UI Elements
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400 mb-6">
              Here are some of the elements I've build especially for this site:
            </p>
            <p class="text-black font-medium mb-2">Letter stack</p>
            <div class="bg-zinc-100 rounded-xl group px-2 pb-2 dark:bg-zinc-950 mb-12">
              <div class="w-full h-64 relative overflow-hidden flex items-end justify-center">
                <div class="absolute w-[70%] h-56 bg-zinc-50 border border-zinc-200/70 rounded-lg -bottom-2 shadow-xl shadow-black/5 transition-all dark:bg-zinc-900 dark:border-zinc-800 hover:mb-4 hover:bg-white dark:hover:bg-zinc-800 dark:hover:border-zinc-700" />
                <div class="absolute w-[80%] h-56 bg-zinc-50 border border-zinc-200/70 rounded-lg -bottom-8 shadow-xl shadow-black/5 transition-all dark:bg-zinc-900 dark:border-zinc-800 hover:mb-4 hover:bg-white dark:hover:bg-zinc-800 dark:hover:border-zinc-700" />
                <div class="absolute w-[90%] h-56 bg-zinc-50 border border-zinc-200/70 rounded-lg -bottom-14 shadow-xl shadow-black/5 transition-all dark:bg-zinc-900 dark:border-zinc-800 hover:mb-4 hover:bg-white dark:hover:bg-zinc-800 dark:hover:border-zinc-700" />
              </div>
              <pre class="dark:selection:bg-zinc-800 text-sm h-full rounded-lg font-mono flex flex-col justify-between border border-black/5 dark:border-white/5">
                <code class="language-typescript overflow-x-scroll px-2 pb-2 custom-scrollbar rounded-[7px]">{`// Fetch the letters from endpoint
const fetchLetters = async () => {
  try {
    const latestLetters = await fetch("/api/letters")
    return await latestLetters.json()
  } catch (error) {
    console.error(error)
  }
}
`}</code>
              </pre>
            </div>
            <p class="text-black font-medium mb-2">Slider</p>
            <div class="bg-zinc-100 rounded-xl group px-2 pb-2 dark:bg-zinc-950 mb-12">
              <div class="w-full lg:h-64 h-auto py-8 relative overflow-hidden flex items-center justify-center px-4 lg:px-16">
                <Slider>
                  <div class="bg-zinc-200 w-32 rounded-md aspect-square mr-8 dark:bg-zinc-700" />
                  <div class="bg-zinc-200 w-32 rounded-md aspect-square mr-8 dark:bg-zinc-700" />
                  <div class="bg-zinc-200 w-32 rounded-md aspect-square mr-8 dark:bg-zinc-700" />
                  <div class="bg-zinc-200 w-32 rounded-md aspect-square mr-8 dark:bg-zinc-700" />
                  <div class="bg-zinc-200 w-32 rounded-md aspect-square mr-8 dark:bg-zinc-700" />
                </Slider>
              </div>
              <pre class="dark:selection:bg-zinc-800 text-sm h-full rounded-lg font-mono flex flex-col justify-between border border-black/5 dark:border-white/5">
                <code class="language-typescript overflow-x-scroll px-2 pb-2 custom-scrollbar rounded-[7px]">{`// The component
import Flicking from "@egjs/preact-flicking"
import "@egjs/preact-flicking/dist/flicking.css"
// ...

export default function Slider(props: {
  autoPlay?: boolean
  buttons?: boolean
  children: JSX.Element[] | Element[]
}) {
  // ...
  return (<div class="w-full relative md:block flex flex-wrap gap-y-12 gap-x-4">
      <Flicking
        ref={slider}
        hideBeforeInit
        align="next"
        circular={true}
        panelsPerView={panelsNumber}
        moveType="snap"
        preventDefaultOnDrag
        plugins={plugins}
        cameraClass="cursor-grab active:cursor-grabbing"
      >
        {props.children}
      </Flicking>
      <Button
        rounded
        type="secondary"
        function={() => {
          slider.current?.prev()
        }}
        class="md:absolute z-10 -translate-y-1/2 top-1/2 left-0 md:-left-8 md:shadow-xl shadow-black/5 hover:pl-4 hover:pr-6"
      >
        <ArrowLeft />
      </Button>
      <Button
        rounded
        type="secondary"
        function={() => {
          slider.current?.next()
        }}
        class="md:absolute z-10 -translate-y-1/2 top-1/2 right-0 md:-right-8 md:shadow-xl shadow-black/5 hover:pl-6 hover:pr-4"
      >
        <ArrowRight />
      </Button>
    </div>)
`}</code>
              </pre>
            </div>
            <p class="text-black font-medium mb-2">Tooltip</p>
            <div class="bg-zinc-100 rounded-xl px-2 pb-2 dark:bg-zinc-950">
              <div class="w-full h-64 relative overflow-hidden flex items-center justify-center">
                <p class="group relative font-medium cursor-default">
                  <Tooltip position="top" class="-translate-y-2">
                    Custom Tooltip
                  </Tooltip>
                  Hover over me
                </p>
              </div>
              <pre class="dark:selection:bg-zinc-800 text-sm h-full rounded-lg font-mono flex flex-col justify-between border border-black/5 dark:border-white/5">
                <code class="language-typescript overflow-x-scroll px-2 pb-2 custom-scrollbar rounded-[7px]">{`// Fetch the letters from endpoint
import { JSX } from "preact/jsx-runtime"

export default function Tooltip(props: {
  children: string | JSX.Element | Element
  position: "top" | "left" | "right" | "bottom"
  class?: string
}) {
  return (
    <span
      class={
        "opacity-0 font-normal group-hover:opacity-100 delay-75 scale-90 group-hover:scale-100 pointer-events-none transition-all duration-300 ease-out absolute text-sm px-2 py-1 rounded-full bg-black z-[99] text-white dark:bg-white dark:text-black " +
        (props.position === "top"
          ? "-top-5 group-hover:-top-6 left-[50%] translate-x-[-50%]"
          : "") +
        (props.position === "bottom"
          ? "-bottom-5 group-hover:-bottom-6 left-[50%] translate-x-[-50%]"
          : "") +
        (props.position === "left"
          ? "left-5 group-hover:-left-6 top-[50%] translate-y-[-50%]"
          : "") +
        (props.position === "right"
          ? "right-5 group-hover:-right-6 top-[50%] translate-y-[-50%]"
          : "") +
        props.class
      }
    >
      <span
        class={
          "w-2.5 h-2.5 rounded-sm bg-black absolute scale-75 group-hover:scale-100 transition-transform duration-300 z-30 transform rotate-45 dark:bg-white " +
          (props.position === "top"
            ? "-bottom-1 left-[50%] translate-x-[-50%]"
            : "") +
          (props.position === "bottom"
            ? "-top-1 left-[50%] translate-x-[-50%]"
            : "") +
          (props.position === "left"
            ? "-right-0.5 top-[50%] translate-y-[-50%]"
            : "") +
          (props.position === "right"
            ? "-left-0.5 top-[50%] translate-y-[-50%]"
            : "")
        }
      />
      <span class="z-50 relative truncate">{props.children}</span>
    </span>
  )
}
`}</code>
              </pre>
            </div>
          </div>

          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">Tech Stack</p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400 mb-6">
              The tech stack I've used might seem more advanced than you'd
              probably expect. One goal I followed was to use unopinionated
              tooling which allowed me to build my site as flexible as possible.
            </p>
            <ul class="text-zinc-500 dark:text-zinc-400 space-y-2">
              <li>
                Dev Environment:{" "}
                <InlineLink link="https://vitejs.dev/">Vite</InlineLink>
              </li>
              <li>
                SSR / Prerendering:{" "}
                <InlineLink link="https://vike.dev/">Vike</InlineLink>
              </li>
              <li>
                JS Framework:{" "}
                <InlineLink link="https://preactjs.com/">Preact</InlineLink>
              </li>
              <li>
                Markdown parsing:{" "}
                <InlineLink link="https://github.com/markedjs/marked">
                  marked
                </InlineLink>
              </li>
              <li>
                CSS Framework:{" "}
                <InlineLink link="https://tailwindcss.com/">
                  Tailwind CSS
                </InlineLink>
              </li>
              <li>
                Contact Form endpoint:{" "}
                <InlineLink link="https://formspree.io/">Formspree</InlineLink>
              </li>
              <li>
                Database (for the letter-stack):{" "}
                <InlineLink link="https://firebase.google.com/">
                  Firebase
                </InlineLink>
              </li>
              <li>
                Analytics:{" "}
                <InlineLink link="https://vercel.com/analytics">
                  Vercel Analytics
                </InlineLink>
              </li>
              <li>
                Translation:{" "}
                <InlineLink link="https://inlang.com/m/gerre34r/library-inlang-paraglideJs">
                  inlang paraglide JS
                </InlineLink>
              </li>
              <li>
                Type Syntax:{" "}
                <InlineLink link="https://www.typescriptlang.org/">
                  Typescript
                </InlineLink>
              </li>
            </ul>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">Hosting</p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              My personal site is hosted on{" "}
              <InlineLink link="https://vercel.com/">Vercel</InlineLink>. The
              repository for it on{" "}
              <InlineLink link="https://github.com/">GitHub</InlineLink>.
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">
            Inspiration
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              I got inspired by the following sites from awesome people{" "}
              <InlineLink link="https://linusrogge.com/">
                Linus Rogge
              </InlineLink>
              ,{" "}
              <InlineLink link="https://samuelkraft.com/">
                Samuel Kraft
              </InlineLink>
              , <InlineLink link="https://sdrn.co/">Siddharth Arun</InlineLink>,
              and{" "}
              <InlineLink link="https://endless.design/">Daryl Ginn</InlineLink>
              .
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">
            Great humans
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              This is a special section for giving credit to special people I
              like talking to, working with and enjoying time together:{" "}
              <InlineLink link="https://nilseller.com/">Nils Eller</InlineLink>,{" "}
              <InlineLink link="https://antonstallboerger.com/">
                Anton Stallbörger
              </InlineLink>
              ,{" "}
              <InlineLink link="https://linusrogge.com/">
                Linus Rogge
              </InlineLink>
              , and{" "}
              <InlineLink link="https://linusrogge.com/">
                Nico Tritschler
              </InlineLink>
              . <br /> Obviously I also want to mention the talented team at{" "}
              <InlineLink link="https://inlang.com/">inlang</InlineLink> here.
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">Feedback</p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              While building this site, I got feedback from: TBD
            </p>
          </div>
        </div>
        <Island
          link="https://github.com/flornkm/florians-site"
          icon={
            <div class="relative">
              <Star class="text-yellow-500 flex-shrink-0" />
              <Star class="text-yellow-500 flex-shrink-0 text-6xl absolute top-1/2 -translate-y-1/2 left-0 blur-3xl" />
            </div>
          }
          class="order-1 md:order-4"
        >
          <p class="line-clamp-2">
            Star on GitHub{" "}
            <span class="text-zinc-400 text-sm dark:text-zinc-500 md:inline-block block md:ml-2">
              Find my open-source repository on GitHub.
            </span>
          </p>
        </Island>
      </section>
    </div>
  )
}
