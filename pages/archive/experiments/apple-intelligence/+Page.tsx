import Button, { InlineLink } from "#components/Button"
import "#design-system/experiments.css"
import { useState } from "preact/hooks"

export default function Page() {
  const [open, setOpen] = useState(false)
  const [transition, setTransition] = useState(false)

  return (
    <>
      <div class="flex items-center mb-4 py-2 bg-transparent sticky top-0 lg:top-14 z-50">
        <div class="w-[99vw] bg-light-neutral/95 backdrop-blur-xl dark:bg-black/90 absolute top-0 bottom-0 left-1/2 -translate-x-1/2" />
        <div class="flex relative z-20">
          <InlineLink link="/archive" class="px-1.5 -ml-1.5">
            Archive
          </InlineLink>
          <p> / </p>
          <InlineLink link="/archive/experiments" class="px-1.5 line-clamp-1">
            Experiments
          </InlineLink>
          <p> / </p>
          <p class="font-medium px-1.5 text-neutral-400 dark:text-neutral-600 truncate">
            Apple Intelligence
          </p>
        </div>
      </div>

      <div class="relative w-full h-[80vh] overflow-hidden rounded-2xl flex items-center justify-center">
        <div
          style={{
            backdropFilter: transition ? "blur(0)" : "blur(128px)",
            opacity: transition ? 0 : 1,
            pointerEvents: transition ? "none" : "auto",
          }}
          class="absolute z-50 inset-0 bg-white/25 transition-all duration-1000 flex items-center justify-center flex-col gap-2"
        >
          <div class="flex flex-col justify-between items-center mix-blend-multiply">
            <h2 class="mb-4 text-3xl font-semibold text-black/40 dark:text-white/40">
              Apple Intelligence (web-based) Animation
            </h2>
            <Button
              type="text"
              function={() => {
                setTransition(true)
                setTimeout(() => {
                  setOpen(true)
                }, 1000)
              }}
              class="mb-4 text-lg text-black/40 dark:text-white/40 font-semibold"
            >
              Enter
            </Button>
          </div>
        </div>
        <div class="absolute inset-0 pointer-events-none w-full h-full">
          <GradientBorder size={40} blur={80} />
          <GradientBorder size={16} blur={24} />
          <GradientBorder size={8} blur={16} />
        </div>
        <svg
          width="2063"
          height="1172"
          viewBox="0 0 2063 1172"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="absolute inset-0 w-full h-full pointer-events-none scale-125 xl:left-40"
        >
          <path
            d="M0 40.5C629 40.5 792 1131.5 2063 1131.5"
            stroke="url(#paint0_linear_3047_886)"
            stroke-width="80"
            stroke-linecap="round"
            class="path"
          />
          <defs>
            <linearGradient
              id="paint0_linear_3047_886"
              x1="1706.1"
              y1="40.3556"
              x2="-175.615"
              y2="562.567"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.245" stop-color="#C673EA" />
              <stop offset="0.705" stop-color="#E377AB" />
              <stop offset="1" stop-color="#EE8A41" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          fill="none"
          class="absolute z-10 inset-0 w-full h-full pointer-events-none scale-125 xl:left-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            class="path"
            d="M-306 1114.5C544.5 1114.5 793.696 354.897 1313 84.4996C1832.5 -186 2591.33 167.166 3023.5 415.5"
            stroke="url(#paint0_linear_3047_885)"
            stroke-width="80"
            stroke-linecap="round"
          />
          <defs>
            <linearGradient
              id="paint0_linear_3047_885"
              x1="2447.5"
              y1="-12.9998"
              x2="-306"
              y2="1180.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.245" stop-color="#EF973E" />
              <stop offset="0.705" stop-color="#A675F7" />
              <stop offset="1" stop-color="#489DF8" />
            </linearGradient>
          </defs>
        </svg>
        <div id="magnetic-thing bg-white relative z-10">
          <h1
            style={{
              transform: open ? "scale(1)" : "scale(0)",
              opacity: open ? 1 : 0,
            }}
            class="ai-gradient text-[8vw] font-semibold leading-tight tracking-tight transition-all duration-1000"
          >
            Intelligence in the Web
          </h1>
        </div>
      </div>
    </>
  )
}

function GradientBorder({ size, blur }: { size: number; blur: number }) {
  return (
    <svg
      style={{ filter: `blur(${blur}px)` }}
      class={`absolute inset-0 w-full h-full`}
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stop-color="hsl(284, 100%, 60%)">
            <animate
              attributeName="stop-color"
              values="hsl(214, 100%, 60%); hsl(33, 100%, 60%); hsl(294, 100%, 60%); hsl(214, 100%, 60%)"
              dur="10s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stop-color="hsl(203, 100%, 60%)">
            <animate
              attributeName="stop-color"
              values="hsl(33, 100%, 60%); hsl(214, 100%, 60%); hsl(206, 100%, 60%); hsl(33, 100%, 60%)"
              dur="5s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>
      <rect width="100%" height={size} fill="url(#gradient)" y="0" />
      <rect
        width={size}
        height="100%"
        fill="url(#gradient)"
        x={`calc(100% - ${size}px)`}
      />
      <rect
        width="100%"
        height={size}
        fill="url(#gradient)"
        y={`calc(100% - ${size}px)`}
      />
      <rect width={size} height="100%" fill="url(#gradient)" x="0" />
    </svg>
  )
}
