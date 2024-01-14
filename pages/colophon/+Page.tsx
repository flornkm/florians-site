import { InlineLink } from "#components/Button"
import { Star } from "#design-system/Icons"
import Island from "#components/Island"
import hljs from "highlight.js"
import { useEffect } from "preact/hooks"
import Slider from "#components/Slider"
import Tooltip from "#components/Tooltip"
import * as m from "#lang/paraglide/messages"

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
      <section class="w-full lg:pt-8 relative min-h-screen flex flex-col">
        <h1 class="text-3xl font-semibold mb-4 w-full order-2 md:order-1">
          {m.colophon_title()}
        </h1>
        <p class="text-zinc-500 mb-16 max-w-lg dark:text-zinc-400 order-3 md:order-2">
          {m.colophon_description()}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-6 md:items-start order-4 md:order-3 pb-32">
          <p class="font-semibold leading-snug flex items-center">
            {m.title_typography()}
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              F{m.text_typography_first()}{" "}
              <InlineLink link="https://github.com/orioncactus/pretendard">
                {m.text_typography_pretendard()}
              </InlineLink>
              {m.text_typography_second()}
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-medium leading-snug flex items-center">
            {m.title_iconography()}
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              {m.text_iconography_first()}{" "}
              <InlineLink link="https://iconists.co/central">
                Central Icon System by Iconists
              </InlineLink>
              {m.text_iconography_second()}
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">
            {m.title_photography()}
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              {m.text_photography_first()}{" "}
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
          <p class="font-semibold leading-snug flex items-center">
            {m.title_mockups()}
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              {m.text_mockups_first()}{" "}
              <InlineLink link="https://artboard.studio/">
                Artboard Studio
              </InlineLink>{" "}
              {m.text_mockups_second()}
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">
            {m.title_ui_elements()}
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400 mb-6">
              {m.text_ui_elements_first()}
            </p>
            <p class="text-black font-medium mb-2">{m.title_letter_stack()}</p>
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
            <p class="text-black font-medium mb-2">{m.title_slider()}</p>
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
            <p class="text-black font-medium mb-2">{m.title_tooltip()}</p>
            <div class="bg-zinc-100 rounded-xl px-2 pb-2 dark:bg-zinc-950">
              <div class="w-full h-64 relative overflow-hidden flex items-center justify-center">
                <p class="group relative font-medium cursor-default">
                  <Tooltip position="top" class="-translate-y-2">
                    {m.tooltip_example()}
                  </Tooltip>
                  {m.hover_text()}
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
          <p class="font-semibold leading-snug flex items-center">
            {m.title_tech_stack()}
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400 mb-6">
              {m.text_tech_stack_first()}
            </p>
            <ul class="text-zinc-500 dark:text-zinc-400 space-y-2">
              <li>
                {m.list_dev_env()}{" "}
                <InlineLink link="https://vitejs.dev/">Vite</InlineLink>
              </li>
              <li>
                {m.ssr_list()}{" "}
                <InlineLink link="https://vike.dev/">Vike</InlineLink>
              </li>
              <li>
                {m.list_js_framework()}{" "}
                <InlineLink link="https://preactjs.com/">Preact</InlineLink>
              </li>
              <li>
                {m.list_markdown_parsing()}{" "}
                <InlineLink link="https://github.com/markedjs/marked">
                  marked
                </InlineLink>
              </li>
              <li>
                {m.list_css_framework()}{" "}
                <InlineLink link="https://tailwindcss.com/">
                  Tailwind CSS
                </InlineLink>
              </li>
              <li>
                {m.list_contact()}{" "}
                <InlineLink link="https://formspree.io/">Formspree</InlineLink>
              </li>
              <li>
                {m.list_database()}{" "}
                <InlineLink link="https://firebase.google.com/">
                  Firebase
                </InlineLink>
              </li>
              <li>
                {m.list_analytics()}{" "}
                <InlineLink link="https://vercel.com/analytics">
                  Vercel Analytics
                </InlineLink>
              </li>
              <li>
                {m.list_translation()}{" "}
                <InlineLink link="https://inlang.com/m/gerre34r/library-inlang-paraglideJs">
                  inlang paraglide JS
                </InlineLink>
              </li>
              <li>
                {m.list_type()}{" "}
                <InlineLink link="https://www.typescriptlang.org/">
                  Typescript
                </InlineLink>
              </li>
            </ul>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">
            {m.title_hosting()}
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              {m.text_hosting_first()}{" "}
              <InlineLink link="https://vercel.com/">Vercel</InlineLink>,{" "}
              {m.text_hosting_second()}{" "}
              <InlineLink link="https://github.com/">GitHub</InlineLink>.
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">
            {m.title_inspiration()}
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              {m.text_inspiration_first()}{" "}
              <InlineLink link="https://linusrogge.com/">
                Linus Rogge
              </InlineLink>
              ,{" "}
              <InlineLink link="https://samuelkraft.com/">
                Samuel Kraft
              </InlineLink>
              ,{" "}
              <InlineLink link="https://www.eikedrescher.com/">
                Eike Drescher
              </InlineLink>
              , <InlineLink link="https://sdrn.co/">Siddharth Arun</InlineLink>,
              and{" "}
              <InlineLink link="https://endless.design/">Daryl Ginn</InlineLink>
              .
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">
            {m.title_great_humans()}
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              {m.text_great_humans_first()}{" "}
              <InlineLink link="https://nilseller.com/">Nils Eller</InlineLink>,{" "}
              <InlineLink link="https://antonstallboerger.com/">
                Anton Stallbörger
              </InlineLink>
              ,{" "}
              <InlineLink link="https://linusrogge.com/">
                Linus Rogge
              </InlineLink>
              , and Nico Tritschler . <br /> {m.text_great_humans_second()}{" "}
              <InlineLink link="https://inlang.com/">inlang</InlineLink> here.
            </p>
          </div>
          <div class="border-b border-b-zinc-100 my-2 dark:border-b-zinc-900 md:col-span-2" />
          <p class="font-semibold leading-snug flex items-center">
            {m.title_feedback()}
          </p>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">
              While building this site, I got feedback from:{" "}
              <InlineLink link="https://twitter.com/stallboerger">
                Anton Stallbörger
              </InlineLink>
              ,{" "}
              <InlineLink link="https://twitter.com/dvdqrng">
                David Quiring
              </InlineLink>
              ,{" "}
              <InlineLink link="https://twitter.com/eikedrescher">
                Eike Drescher
              </InlineLink>
              ,{" "}
              <InlineLink link="https://twitter.com/_julianherbst">
                Julian Herbst
              </InlineLink>
              ,{" "}
              <InlineLink link="https://twitter.com/krzysztoffduda">
                Krzysztof Duda
              </InlineLink>
              ,{" "}
              <InlineLink link="https://twitter.com/linusrogge">
                Linus Rogge
              </InlineLink>
              ,{" "}
              <InlineLink link="https://twitter.com/nilseller">
                Nils Eller
              </InlineLink>
              ,{" "}
              <InlineLink link="https://twitter.com/prizigner">
                Priyank Shah
              </InlineLink>
              ,{" "}
              <InlineLink link="https://twitter.com/samuelkraft">
                Samuel Kraft
              </InlineLink>
              ,{" "}
              <InlineLink link="https://twitter.com/samuelstroschei">
                Samuel Stroschein
              </InlineLink>
              ,{" "}
              <InlineLink link="https://twitter.com/thilokonzok">
                Thilo Konzok
              </InlineLink>
              .
            </p>
          </div>
        </div>
        <Island
          link="https://github.com/flornkm/florians-site"
          icon={<Star class="text-yellow-500 flex-shrink-0" />}
          class="order-1 md:order-4"
        >
          <p class="line-clamp-2">
            {m.title_star_github()}{" "}
            <span class="text-zinc-400 text-sm dark:text-zinc-500 md:inline-block block md:ml-2">
              {m.text_star_github()}
            </span>
          </p>
        </Island>
      </section>
    </div>
  )
}
