import Flicking from "@egjs/preact-flicking"
import "@egjs/preact-flicking/dist/flicking.css"
import { JSX } from "preact/jsx-runtime"
import { AutoPlay } from "@egjs/flicking-plugins"
import { Arrow } from "@egjs/flicking-plugins"
import { useRef } from "preact/hooks"
import Button from "./Button"
import { createRef } from "preact"

export default function Slider(props: {
  autoPlay?: boolean
  buttons?: boolean
  children: JSX.Element[] | Element[]
}) {
  const slider = useRef<Flicking>()
  const plugins = []
  if (props.autoPlay) plugins.push(new AutoPlay({ duration: 5000 }))

  return (
    <div class="w-full">
      <Flicking
        ref={slider}
        hideBeforeInit
        align="next"
        circular={true}
        panelsPerView={4}
        moveType="snap"
        preventDefaultOnDrag
        plugins={plugins}
        cameraClass="cursor-grab active:cursor-grabbing"
      >
        {props.children}
      </Flicking>
      <p
        onClick={() => {
          slider.current?.prev()
        }}
      >
        Test
      </p>
    </div>
  )
}

export function PhotoSlider(props: { autoPlay?: boolean; buttons?: boolean }) {
  const slides = [
    {
      src: "/images/avatars/florian_student.webp",
      alt: "Florian Student",
      caption: "Florian Student",
    },
    {
      src: "/images/avatars/florian_student.webp",
      alt: "Florian Student",
      caption: "Florian Student",
    },
    {
      src: "/images/avatars/florian_student.webp",
      alt: "Florian Student",
      caption: "Florian Student",
    },
    {
      src: "/images/avatars/florian_student.webp",
      alt: "Florian Student",
      caption: "Florian Student",
    },
    {
      src: "/images/avatars/florian_student.webp",
      alt: "Florian Student",
      caption: "Florian Student",
    },
    {
      src: "/images/avatars/florian_student.webp",
      alt: "Florian Student",
      caption: "Florian Student",
    },
  ]
  return (
    <Slider autoPlay={props.autoPlay} buttons={props.buttons}>
      {slides.map((slide) => (
        <figure key={slide} class="mr-8">
          <img src={slide.src} alt={slide.alt} />
          <figcaption class="text-sm text-zinc-400 mt-3">
            {slide.caption}
          </figcaption>
        </figure>
      ))}
    </Slider>
  )
}
