import { cva } from "class-variance-authority";

export const proseVariants = cva("text-neutral-500 dark:text-neutral-400", {
  variants: {
    variant: {
      default:
        "prose mb-8 prose-li:text-neutral-500 dark:prose-p:text-neutral-400 dark:prose-li:text-neutral-400 dark:prose-a:text-white prose-li:text-ms dark:prose-h1:text-white prose-a:font-normal prose-a:px-[3px] prose-a:py-px prose-a:rounded-xs prose-a:hover:bg-black prose-a:hover:text-white prose-a:transition-all prose-a:transition-duration-200 prose-a:bg-neutral-100 dark:prose-a:bg-neutral-900 dark:prose-a:hover:bg-white dark:prose-a:hover:text-black prose-a:no-underline dark:prose-h2:text-white dark:prose-h3:text-white dark:prose-h4:text-white dark:prose-h5:text-white dark:prose-h6:text-white dark:prose-strong:text-white [&_img]:rounded-lg [&_video]:rounded-lg md:prose-img:max-w-xl prose-p:text-neutral-500 prose-h1:text-lg prose-h1:font-semibold prose-h2:text-base prose-h2:font-semibold prose-h3:text-ms prose-h3:font-semibold prose-p:text-ms prose-p:font-normal",
    },
  },
});
