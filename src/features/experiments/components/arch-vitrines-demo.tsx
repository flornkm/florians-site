import { VITRINES, type Vitrine } from "@/features/experiments/components/arch-vitrines-art";
import { Fragment, useEffect, useRef } from "react";
import "./arch-vitrines-demo.css";

/* Two woodcut line-art plates set into arched vitrines, like specimens in a museum niche: an
   indigo ink outline framing the drawing. Every stroke is inline SVG in currentColor, so the arch
   border and the art share one ink that flips light/dark. Each plate carries a baked rough-ink
   filter (edge displacement + a grain of speckle holes) that gives the strokes a torn, dry woodcut
   texture without fattening them. Static until pointed at — then the plate lifts, a few sparks
   twinkle in the same ink (see the css), and the ink boils: the filter's noise seeds are cycled so
   the etching looks re-drawn by hand, frame by frame, like a boiling line in hand-drawn animation. */

const BOIL_INTERVAL_MS = 110;

// Sparks that lift off a hovered plate; offset per plate so the two don't twinkle in unison.
const SPARKS = [
  { top: "22%", left: "22%", size: 9, delay: "0s" },
  { top: "46%", left: "78%", size: 7, delay: "0.5s" },
  { top: "76%", left: "34%", size: 8, delay: "1s" },
];

// A four-point sparkle with concave sides — the same star that's scratched into the etchings.
const SPARK_PATH = "M8 0C8 4.6 11.4 8 16 8C11.4 8 8 11.4 8 16C8 11.4 4.6 8 0 8C4.6 8 8 4.6 8 0Z";

function Plate({ vitrine, sparkOffset }: { vitrine: Vitrine; sparkOffset: number }) {
  const plate = useRef<HTMLDivElement>(null);
  const boil = useRef<number | null>(null);

  const stopBoil = () => {
    if (boil.current === null) return;
    clearInterval(boil.current);
    boil.current = null;
  };

  const startBoil = () => {
    if (boil.current !== null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const noise = plate.current?.querySelectorAll("feTurbulence");
    if (!noise?.length) return;
    let frame = 0;
    boil.current = window.setInterval(() => {
      frame += 1;
      // Prime-ish steps so the two noise fields (warp + grain) never fall back in step.
      noise.forEach((node, i) => node.setAttribute("seed", String((frame * 7 + i * 23) % 89)));
    }, BOIL_INTERVAL_MS);
  };

  useEffect(() => stopBoil, []);

  return (
    <div
      ref={plate}
      // Width-driven on the narrow mobile sheet so two arches always fit across; height-driven
      // on the wide desktop dialog. Only ever one dimension is fixed, so the 5/6 shape holds.
      className="av-vitrine w-[42%] max-w-[9rem] md:h-[42%] md:w-auto md:max-w-none"
      style={{ aspectRatio: "5 / 6" }}
      onPointerEnter={startBoil}
      onPointerLeave={stopBoil}
      onPointerCancel={stopBoil}
    >
      <div className="flex size-full items-center justify-center overflow-hidden rounded-t-full border-[1.5px] border-current p-2.5 [&_svg]:size-full [&_svg]:object-contain">
        {/* Inlined so each stroke resolves currentColor against the arch's ink. */}
        <div className="contents" dangerouslySetInnerHTML={{ __html: vitrine.svg }} />
      </div>
      {SPARKS.map((spark) => (
        <svg
          key={`${vitrine.key}-${spark.top}-${spark.left}`}
          className="av-spark"
          viewBox="0 0 16 16"
          aria-hidden
          style={{
            top: spark.top,
            left: spark.left,
            width: spark.size,
            height: spark.size,
            animationDelay: `calc(${spark.delay} + ${sparkOffset}s)`,
          }}
        >
          <path d={SPARK_PATH} fill="currentColor" />
        </svg>
      ))}
      {/* A museum plate label under the niche: one word at a time, each swimming out of a blur. */}
      <p className="av-title font-serif">
        {vitrine.title.split(" ").map((word, i) => (
          <Fragment key={`${vitrine.key}-${word}-${i}`}>
            {i > 0 && " "}
            <span className="av-word" style={{ animationDelay: `${i * 0.07}s` }}>
              {word}
            </span>
          </Fragment>
        ))}
      </p>
    </div>
  );
}

export const ArchVitrines = () => (
  <div className="arch-vitrines absolute inset-0 flex items-center justify-center gap-4 p-4 text-[#463996] md:gap-10 md:p-6 dark:text-[#a6a1ea]">
    {VITRINES.map((v, i) => (
      <Plate key={v.key} vitrine={v} sparkOffset={i * 0.45} />
    ))}
  </div>
);
