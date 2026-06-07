import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";
import { Image } from "./image";

// The figure caption fades in one word at a time, each blurring into focus.
function AnimatedCaption({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <motion.figcaption
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: 0.15, staggerChildren: 0.045 } },
      }}
      className={cn(
        "mx-auto mt-4 max-w-[460px] text-center font-serif text-[11px] font-normal italic text-primary",
        className,
      )}
    >
      {words.map((word, i) => (
        <motion.span
          // Words are positional, not unique — the index is the only stable key.
          key={i}
          className="inline-block whitespace-pre"
          variants={{
            hidden: { opacity: 0, y: 4, filter: "blur(4px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.figcaption>
  );
}

interface FigureImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function FigureImage({ src, alt, className }: FigureImageProps) {
  // SVGs render borderless on a dot panel; photos keep the framed look.
  const isDiagram = src.toLowerCase().endsWith(".svg");
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <figure className={cn("not-prose my-8 first:mt-0 last:mb-0", isDiagram && "max-w-[640px]")}>
        {/* On mobile the panel breaks out of ancestor padding to line up with the body
            text's 24px side padding (the root layout's px-6); from md up it's a normal block. */}
        <Dialog.Trigger
          aria-label={alt ? `Open image: ${alt}` : "Open image"}
          className={cn(
            "block w-full cursor-zoom-in appearance-none rounded-lg text-left outline-none",
            "focus-visible:ring-2 focus-visible:ring-default",
            "max-md:ml-[50%] max-md:w-[calc(100vw-48px)] max-md:-translate-x-1/2",
          )}
        >
          <div
            className={cn(
              "transition-opacity duration-200 hover:opacity-90",
              isDiagram ? "figure-dots p-4 md:p-8" : "rounded-lg bg-secondary p-4 md:p-12",
            )}
          >
            <Image
              src={src}
              alt={alt}
              objectFit="contain"
              className={cn(
                "h-auto w-full",
                !isDiagram &&
                  "rounded-sm outline -outline-offset-1 outline-black/5 dark:outline-white/15",
                className,
              )}
            />
          </div>
        </Dialog.Trigger>
      </figure>

      <Dialog.Portal>
        <Dialog.Backdrop blur="soft" />
        {/* Clicking anywhere on the zoomed figure dismisses it (the zoom-out cursor
            promises this); base-ui only closes on backdrop/Escape on its own. */}
        <Dialog.Popup
          variant="headless"
          className="cursor-zoom-out"
          onClick={() => setOpen(false)}
        >
          <Dialog.Title className="sr-only">{alt || "Image"}</Dialog.Title>
          <div className="rounded-lg bg-surface p-6 shadow-emphasis md:p-10 dark:bg-neutral-950">
            {/* Plain <img>: the popup shrink-wraps to the natural size, and the source is
                already decoded from the inline figure, so no thumbhash blur-up is needed. */}
            <img
              src={src}
              alt={alt}
              decoding="async"
              className="h-auto max-h-[72vh] w-auto max-w-[min(88vw,56rem)] object-contain"
            />
          </div>
          {alt && <AnimatedCaption text={alt} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
