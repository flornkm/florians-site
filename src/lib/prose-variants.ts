import { cva } from "class-variance-authority";

export const proseVariants = cva("text-text-tertiary", {
  variants: {
    variant: {
      default: [
        "prose mb-8",
        "prose-p:text-text-tertiary prose-p:text-ms prose-p:font-normal",
        "prose-li:text-text-tertiary prose-li:text-ms prose-li:marker:text-text-quaternary",
        "prose-h1:text-text-primary prose-h1:text-lg prose-h1:font-semibold",
        "prose-h2:text-text-primary prose-h2:text-base prose-h2:font-semibold",
        "prose-h3:text-text-primary prose-h3:text-ms prose-h3:font-semibold",
        "prose-h4:text-text-primary prose-h5:text-text-primary prose-h6:text-text-primary",
        "prose-strong:text-text-primary",
        "prose-a:text-text-primary prose-a:font-normal prose-a:transition-all prose-a:duration-200 prose-a:underline prose-a:decoration-border-primary prose-a:hover:decoration-text-primary prose-a:underline-offset-2",
        "prose-hr:border-border-primary",
        "prose-pre:bg-surface-secondary prose-code:text-text-secondary prose-code:text-xs prose-code:font-mono",
        "[&_img]:rounded-lg [&_video]:rounded-lg md:prose-img:max-w-xl",
      ],
    },
  },
});
