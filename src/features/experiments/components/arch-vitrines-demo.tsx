import { VITRINES } from "@/features/experiments/components/arch-vitrines-art";

/* Two woodcut line-art plates set into arched vitrines, like specimens in a museum niche: an
   indigo ink outline framing the drawing. Every stroke is inline SVG in currentColor, so the arch
   border and the art share one ink that flips light/dark. Each plate carries a baked rough-ink
   filter (edge displacement + a grain of speckle holes) that gives the strokes a torn, dry woodcut
   texture without fattening them. Static — the plates render instantly, no entrance animation. */

export const ArchVitrines = () => (
  <div className="absolute inset-0 flex items-center justify-center gap-4 p-4 text-[#463996] md:gap-10 md:p-6 dark:text-[#a6a1ea]">
    {VITRINES.map((v) => (
      <div
        key={v.key}
        // Width-driven on the narrow mobile sheet so two arches always fit across; height-driven
        // on the wide desktop dialog. Only ever one dimension is fixed, so the 5/6 shape holds.
        className="flex w-[42%] max-w-[9rem] items-center justify-center overflow-hidden rounded-t-full border-[1.5px] border-current p-2.5 md:h-[42%] md:w-auto md:max-w-none [&_svg]:size-full [&_svg]:object-contain"
        style={{ aspectRatio: "5 / 6" }}
        // Inlined so each stroke resolves currentColor against the arch's ink.
        dangerouslySetInnerHTML={{ __html: v.svg }}
      />
    ))}
  </div>
);
