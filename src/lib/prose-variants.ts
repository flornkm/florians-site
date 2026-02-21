import { cva } from "class-variance-authority";

export const proseVariants = cva("text-tertiary", {
  variants: {
    variant: {
      default: [
        "prose max-w-none mb-8 font-[450] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        "prose-p:text-primary prose-p:text-sm",
        "prose-li:text-primary prose-li:text-sm prose-li:marker:text-quaternary/50",
        "prose-h1:text-primary prose-h1:text-base prose-h1:font-semibold prose-h1:scroll-mt-20",
        "prose-h2:text-primary prose-h2:text-sm prose-h2:font-semibold prose-h2:scroll-mt-20",
        "prose-h3:text-primary prose-h3:text-sm prose-h3:font-semibold prose-h3:scroll-mt-20",
        "prose-h4:text-primary prose-h4:scroll-mt-20 prose-h5:text-primary prose-h6:text-primary",
        "prose-strong:text-primary",
        "prose-a:text-primary prose-a:transition-all prose-a:duration-200 prose-a:underline prose-a:decoration-muted prose-a:hover:decoration-emphasis/50 prose-a:underline-offset-2",
        "prose-hr:border-primary",
        "prose-pre:bg-surface-secondary prose-code:text-secondary prose-code:text-xs prose-code:font-mono",
        "md:prose-img:max-w-xl",
      ],
    },
  },
});
