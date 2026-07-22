import { VITRINES, type Vitrine } from "@/features/experiments/components/arch-vitrines-art";
import "./arch-vitrines-demo.css";

/* Two woodcut line-art plates set into arched vitrines, like specimens in a museum niche: an
   indigo ink outline framing the drawing. Every stroke is inline SVG in currentColor, so the arch
   border and the art share one ink that flips light/dark. The ink "boils" continuously — the
   etching looks re-drawn by hand, frame by frame, like a boiling line in hand-drawn animation.
   No JS drives it: re-seeding feTurbulence per frame is what Safari couldn't keep up with.
   Instead each plate is three copies of the same SVG whose baked rough-ink filters carry
   different noise seeds, cycled by a CSS opacity loop (see the css). Each copy's filter is
   static, so the browser rasterises it once and the boil costs only compositing. */

// The boiling-line cadence: three drawings swapped at ~9fps.
const BOIL_FRAMES = [0, 1, 2];
const BOIL_FRAME_MS = 110;

// Each copy needs its own distortion: suffix the filter ids (three copies of one plate would
// otherwise all resolve url(#…) to the first copy's filter) and shift every noise seed.
const frameSvg = (svg: string, frame: number) =>
  svg
    .replace(/(id="|url\(#)([kr]-ink)/g, (_, prefix, name) => `${prefix}${name}-f${frame}`)
    .replace(/seed="(\d+)"/g, (_, seed) => `seed="${(Number(seed) + frame * 37) % 97}"`);

const PLATES = VITRINES.map((vitrine) => ({
  vitrine,
  frames: BOIL_FRAMES.map((frame) => frameSvg(vitrine.svg, frame)),
}));

// Sparks twinkling in the niche; offset per plate so the two don't twinkle in unison.
const SPARKS = [
  { top: "22%", left: "22%", size: 9, delay: "0s" },
  { top: "46%", left: "78%", size: 7, delay: "0.5s" },
  { top: "76%", left: "34%", size: 8, delay: "1s" },
];

// A four-point sparkle with concave sides — the same star that's scratched into the etchings.
const SPARK_PATH = "M8 0C8 4.6 11.4 8 16 8C11.4 8 8 11.4 8 16C8 11.4 4.6 8 0 8C4.6 8 8 4.6 8 0Z";

function Plate({ vitrine, frames, sparkOffset }: {
  vitrine: Vitrine;
  frames: string[];
  sparkOffset: number;
}) {
  return (
    <div
      // Width-driven on the narrow mobile sheet so two arches always fit across; height-driven
      // on the wide desktop dialog. Only ever one dimension is fixed, so the 5/6 shape holds.
      className="av-vitrine w-[42%] max-w-[9rem] md:h-[42%] md:w-auto md:max-w-none"
      style={{ aspectRatio: "5 / 6" }}
    >
      <div className="size-full overflow-hidden rounded-t-full border-[1.5px] border-current p-2.5">
        <div className="relative size-full [&_svg]:size-full [&_svg]:object-contain">
          {/* Inlined so each stroke resolves currentColor against the arch's ink. */}
          {frames.map((frame, i) => (
            <div
              key={`${vitrine.key}-f${i}`}
              className="av-frame"
              style={{ animationDelay: `${i * BOIL_FRAME_MS}ms` }}
              dangerouslySetInnerHTML={{ __html: frame }}
            />
          ))}
        </div>
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
    </div>
  );
}

export const ArchVitrines = () => (
  <div className="arch-vitrines absolute inset-0 flex items-center justify-center gap-4 p-4 text-[#463996] md:gap-10 md:p-6 dark:text-[#a6a1ea]">
    {PLATES.map(({ vitrine, frames }, i) => (
      <Plate key={vitrine.key} vitrine={vitrine} frames={frames} sparkOffset={i * 0.45} />
    ))}
  </div>
);
