import { cva } from "class-variance-authority";

export const proseVariants = cva("text-tertiary", {
  variants: {
    variant: {
      default: [
        "prose mb-8",
        "prose-p:text-tertiary prose-p:text-ms prose-p:font-normal",
        "prose-li:text-tertiary prose-li:text-ms prose-li:marker:text-quaternary",
        "prose-h1:text-primary prose-h1:text-lg prose-h1:font-semibold",
        "prose-h2:text-primary prose-h2:text-base prose-h2:font-semibold",
        "prose-h3:text-primary prose-h3:text-ms prose-h3:font-semibold",
        "prose-h4:text-primary prose-h5:text-primary prose-h6:text-primary",
        "prose-strong:text-primary",
        "prose-a:text-primary prose-a:font-normal prose-a:transition-all prose-a:duration-200 prose-a:underline prose-a:decoration-muted prose-a:hover:decoration-emphasis prose-a:underline-offset-2",
        "prose-hr:border-primary",
        "prose-pre:bg-surface-secondary prose-code:text-secondary prose-code:text-xs prose-code:font-mono",
        "[&_img]:rounded-lg [&_video]:rounded-lg md:prose-img:max-w-xl",
      ],
    },
  },
});
