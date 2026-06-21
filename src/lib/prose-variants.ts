import { cva } from "class-variance-authority";

export const proseVariants = cva("text-tertiary", {
  variants: {
    variant: {
      default: [
        "prose max-w-none mb-8 font-[430] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        "prose-p:text-primary prose-p:text-sm prose-p:leading-relaxed",
        "prose-li:text-primary prose-li:text-sm prose-li:leading-relaxed prose-li:marker:text-quaternary/50",
        "prose-h1:text-primary prose-h1:text-base prose-h1:font-[550] prose-h1:scroll-mt-20",
        "prose-h2:text-primary prose-h2:text-sm prose-h2:font-[550] prose-h2:scroll-mt-20",
        "prose-h3:text-primary prose-h3:text-sm prose-h3:font-[550] prose-h3:scroll-mt-20",
        "prose-h4:text-primary prose-h4:scroll-mt-20 prose-h5:text-primary prose-h6:text-primary",
        "prose-strong:text-primary",
        "prose-img:rounded-sm",
        "prose-a:text-primary prose-a:font-[450] prose-a:transition-all prose-a:duration-200 prose-a:underline prose-a:decoration-tertiary/40 prose-a:hover:decoration-tertiary/70 prose-a:underline-offset-[3px] prose-a:active:no-underline",
        "prose-figcaption:text-tertiary prose-figcaption:text-[10px] prose-figcaption:mt-3",
        "prose-hr:border-primary",
        "prose-pre:bg-surface-secondary prose-code:text-secondary prose-code:text-xs prose-code:font-mono",
        "md:prose-img:max-w-xl",
      ],
    },
  },
});
