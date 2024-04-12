import Flicking from "@egjs/preact-flicking"
import "@egjs/preact-flicking/dist/flicking.css"
import { JSX } from "preact/jsx-runtime"
import { AutoPlay } from "@egjs/flicking-plugins"
import { useRef, useState } from "preact/hooks"
import { useWindowResize } from "../hooks/useWindowResize"
import Button from "./Button"
import { ArrowRight, ArrowLeft } from "#design-system/Icons"
import * as m from "#lang/paraglide/messages"

export default function Slider(props: {
  autoPlay?: boolean
  buttons?: boolean
  children: JSX.Element[] | Element[]
}) {
  const slider = useRef<Flicking>(null)
  const [panelsNumber, setPanelsNumber] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth > 1400
        ? 5
        : window.innerWidth > 1250
        ? 4
        : window.innerWidth > 1023
        ? 3
        : window.innerWidth > 768
        ? 2
        : 1
      : 1
  )

  const plugins = []
  if (props.autoPlay) plugins.push(new AutoPlay({ duration: 10000 }))

  useWindowResize(() => {
    setPanelsNumber(
      window.innerWidth > 1400
        ? 5
        : window.innerWidth > 1250
        ? 4
        : window.innerWidth > 1023
        ? 3
        : window.innerWidth > 768
        ? 2
        : 1
    )
  })

  return (
    <div class="w-full relative md:block flex flex-wrap md:gap-y-12 gap-x-4">
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
      <div class="lg:absolute lg:top-1/2 pointer-events-none lg:-translate-y-1/2 lg:mt-0 mt-6 z-10 gap-4 lg:w-full flex lg:justify-between items-center">
        <Button
          rounded
          type="primary"
          function={() => {
            slider.current?.prev()
          }}
          class="shadow-black/5 pointer-events-auto aspect-square -ml-2 px-2 h-10 w-10 lg:px-5 justify-center lg:w-2 lg:hover:pl-4 lg:hover:pr-6 lg:shadow-xl"
        >
          <div class="flex-shrink-0">
            <ArrowLeft size={20} />
          </div>
        </Button>
        <Button
          rounded
          type="primary"
          function={() => {
            slider.current?.next()
          }}
          class="shadow-black/5 pointer-events-auto aspect-square -mr-2 h-10 w-10 lg:px-5 lg:w-2 justify-center lg:hover:pr-4 lg:hover:pl-6 lg:shadow-xl"
        >
          <div class="flex-shrink-0">
            <ArrowRight size={20} />
          </div>
        </Button>
      </div>
    </div>
  )
}

export function PhotoSlider(props: { autoPlay?: boolean; buttons?: boolean }) {
  const slides = [
    {
      src: "/images/photos/painting_inlang.jpg",
      alt: "Image spinning",
      caption: m.photo_description_inlang_onsite(),
    },
    {
      src: "/images/photos/rainy_berlin.jpg",
      alt: "Rain in Berlin",
      caption: m.photo_description_berlin(),
    },
    {
      src: "/images/photos/sms_festival.jpg",
      alt: "Festival night",
      caption: m.photo_description_festival(),
    },
    {
      src: "/images/photos/starting_work.jpg",
      alt: "Florian doing a selfie",
      caption: m.photo_description_apartment(),
    },
    {
      src: "/images/photos/remi_restaurant.jpg",
      alt: "Dinner with design engineers",
      caption: m.photo_description_dinner(),
    },
    {
      src: "/images/photos/inlang_team.jpg",
      alt: "inlang team standing outside",
      caption: m.photo_description_inlang_outside(),
    },
  ]
  return (
    <Slider autoPlay={props.autoPlay} buttons={props.buttons}>
      {slides.map((slide) => (
        <figure key={slide} class="mr-8 group">
          <img src={slide.src} alt={slide.alt} />
          <figcaption class="text-sm text-neutral-400 mt-3 line-clamp-2">
            {slide.caption}
          </figcaption>
        </figure>
      ))}
    </Slider>
  )
}
