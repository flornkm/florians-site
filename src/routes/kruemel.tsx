import { Image } from "@/components/shared/image";
import { PHOTOS } from "@/features/kruemel/const/photos";
import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

// Per-photo grid placement, indexed to match PHOTOS order. On md the two portraits span both
// rows so the wide garden shot settles beside them in row two instead of below everything —
// row one is sized by the trotting shot alone, which is what puts the 24px seam where it belongs.
const PHOTO_LAYOUT = [
  "col-start-1 col-span-4 md:col-start-2 md:col-span-2 md:row-start-1 md:row-span-2",
  "col-start-3 col-span-4 mt-8 md:col-start-5 md:col-span-2 md:row-start-1 md:mt-0",
  "col-start-1 col-span-4 mt-2 md:col-start-7 md:col-span-2 md:row-start-1 md:row-span-2 md:mt-5",
  "col-start-2 col-span-5 mt-8 md:col-start-4 md:col-span-3 md:row-start-2 md:mt-0",
];

export const Route = createFileRoute("/kruemel")({
  head: () => ({
    meta: [
      { title: "Krümel ‹ Florian Kiem" },
      { name: "description", content: "Krümel, 2013-2026. The best dog one could wish for." },
      { property: "og:title", content: "Krümel" },
      {
        property: "og:description",
        content: "Krümel, 2013-2026. The best dog one could wish for.",
      },
      { property: "og:image", content: "/api/og?title=Kr%C3%BCmel" },
      { name: "twitter:title", content: "Krümel" },
      {
        name: "twitter:description",
        content: "Krümel, 2013-2026. The best dog one could wish for.",
      },
      { name: "twitter:image", content: "/api/og?title=Kr%C3%BCmel" },
    ],
  }),
  component: KruemelPage,
});

function KruemelPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <div className="grid grid-cols-6 gap-x-3 md:grid-cols-9 md:gap-x-6">
        <div className="col-start-1 col-span-6 md:col-start-3 md:col-span-2">
          <h1 className="flex items-center gap-1 font-serif text-[12px] leading-normal italic">
            <span className="font-medium text-primary">Krümel</span>
            <span className="font-normal text-tertiary">2013-2026</span>
          </h1>
          {/* The quote wraps at the puppy photo's right edge below it. That photo spans the two
              tracks left of here, so its edge is one track in — and this block is two tracks wide,
              hence (width - gap) / 2. */}
          <blockquote className="mt-3 max-w-60 font-serif text-[12px] leading-[1.4] font-normal text-primary italic md:max-w-[calc((100%-1.5rem)/2)]">
            <p>“The best dog one could wish for.</p>
            <p className="mt-[1.4em]">
              Thank you for the peace you brought to my life. May you now rest in it too.”
            </p>
          </blockquote>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-6 items-start gap-x-3 gap-y-2 md:grid-cols-9 md:gap-x-6 md:gap-y-6">
        {PHOTOS.map((photo, index) => (
          <motion.figure
            key={photo.src}
            className={PHOTO_LAYOUT[index]}
            initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(4px)" }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: "some", margin: "0px 0px 15% 0px" }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              objectFit="cover"
              priority={index < 2}
              sizes="(min-width: 768px) 33vw, 66vw"
              className="h-auto w-full"
            />
          </motion.figure>
        ))}
      </div>
    </div>
  );
}
