import { Dialog } from "@/components/ui/dialog";
import { imageManifest } from "@/imageMap.gen";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnimatedCaption } from "./animated-caption";
import { Image } from "./image";

interface FigureImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Caps the figure width (px) so wide UI captures can be sized down; defaults to full column. */
  width?: number;
  /** Footnote numbers for the image source, e.g. "13" — rendered as a superscript after the caption. */
  sources?: string;
  /** Dark-mode variant, swapped in via prefers-color-scheme. For UI screenshots whose own
      background can't retheme (e.g. a captured GitHub graph). */
  darkSrc?: string;
}

export function FigureImage({ src, alt, className, width, sources, darkSrc }: FigureImageProps) {
  // SVGs render borderless with just padding; photos keep the framed look.
  const isDiagram = src.toLowerCase().endsWith(".svg");
  const [open, setOpen] = useState(false);

  // The zoomed card scales up to fill the viewport: capped by width (92vw / 72rem) or,
  // via the manifest aspect ratio, by height (~78vh incl. the card's 5rem padding) —
  // whichever binds first.
  const entry = imageManifest[src];
  const aspect = entry ? entry.width / entry.height : null;
  const zoomWidth = aspect
    ? `min(92vw, 72rem, calc(${(78 * aspect).toFixed(1)}vh - ${(5 * aspect).toFixed(1)}rem))`
    : "min(92vw, 72rem)";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <figure
        className={cn("not-prose my-8 first:mt-0 last:mb-0", isDiagram && "max-w-[640px]")}
        style={width ? { maxWidth: width } : undefined}
      >
        {/* On mobile the panel breaks out of ancestor padding to line up with the body
            text's 24px side padding (the root layout's px-6); from md up it's a normal block. */}
        <Dialog.Trigger
          aria-label={alt ? `Open image: ${alt}` : "Open image"}
          className={cn(
            "block w-full cursor-zoom-in appearance-none text-left outline-none",
            "focus-visible:ring-2 focus-visible:ring-default",
            "max-md:ml-[50%] max-md:w-[calc(100vw-48px)] max-md:-translate-x-1/2",
          )}
        >
          <div
            className={cn(
              "transition-opacity duration-200 hover:opacity-90",
              isDiagram ? "p-4 md:p-8" : "bg-secondary p-4 md:p-12",
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
                darkSrc && "dark:hidden",
                className,
              )}
            />
            {darkSrc && (
              <Image
                src={darkSrc}
                alt={alt}
                objectFit="contain"
                className={cn(
                  "hidden h-auto w-full dark:block",
                  !isDiagram &&
                    "rounded-sm outline -outline-offset-1 outline-black/5 dark:outline-white/15",
                  className,
                )}
              />
            )}
          </div>
        </Dialog.Trigger>
        {/* Mirrors the body text column: full width on mobile, centred 460px from md up. */}
        {alt && (
          <figcaption className="mt-4 font-serif text-[11px] font-normal italic text-primary md:mx-auto md:max-w-[460px]">
            {alt}
            {sources && <sup className="ml-0.5 text-[9px] text-tertiary">{sources}</sup>}
          </figcaption>
        )}
      </figure>

      <Dialog.Portal>
        <Dialog.Backdrop blur="soft" />
        {/* Clicking anywhere on the zoomed figure dismisses it (the zoom-out cursor
            promises this); base-ui only closes on backdrop/Escape on its own. */}
        <Dialog.Popup variant="headless" className="cursor-zoom-out" onClick={() => setOpen(false)}>
          <Dialog.Title className="sr-only">{alt || "Image"}</Dialog.Title>
          <div
            className="rounded-lg bg-surface p-6 shadow-emphasis md:p-10 dark:bg-neutral-950"
            style={{ width: zoomWidth }}
          >
            {/* Plain <img>: the source is already decoded from the inline figure, so no
                thumbhash blur-up is needed. max-h only binds for images missing a manifest
                entry, where the card width can't be derived from the aspect ratio. */}
            <picture>
              {darkSrc && <source srcSet={darkSrc} media="(prefers-color-scheme: dark)" />}
              <img
                src={src}
                alt={alt}
                decoding="async"
                className="h-auto max-h-[78vh] w-full object-contain"
              />
            </picture>
          </div>
          {alt && <AnimatedCaption text={alt} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
