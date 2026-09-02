import { cva } from "class-variance-authority";

export const proseVariants = cva("text-tertiary", {
  variants: {
    variant: {
      default: [
        "prose max-w-none mb-8 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        "prose-p:text-primary prose-p:text-sm prose-p:leading-relaxed",
        "prose-li:text-primary prose-li:text-sm prose-li:leading-relaxed prose-li:marker:text-quaternary/50",
        "prose-h1:text-primary prose-h1:text-base prose-h1:fw-medium prose-h1:scroll-mt-20",
        "prose-h2:text-primary prose-h2:text-sm prose-h2:fw-medium prose-h2:scroll-mt-20",
        "prose-h3:text-primary prose-h3:text-sm prose-h3:fw-medium prose-h3:scroll-mt-20",
        "prose-h4:text-primary prose-h4:scroll-mt-20 prose-h5:text-primary prose-h6:text-primary",
        "prose-strong:text-primary prose-strong:fw-medium",
        "prose-img:rounded-sm",
        "prose-a:text-primary prose-a:fw-link prose-a:transition-all prose-a:duration-200 prose-a:underline prose-a:decoration-tertiary/40 prose-a:hover:decoration-tertiary/70 prose-a:underline-offset-[3px] prose-a:active:no-underline",
        "prose-figcaption:text-tertiary prose-figcaption:text-[10px] prose-figcaption:mt-3",
        "prose-hr:border-primary",
        // Tables (remark-gfm): hairline rows, tertiary header, bold first column — mirrors the
        // former <Table> component so markdown tables read in the same design language.
        "prose-table:w-full prose-table:my-8 prose-table:text-sm prose-table:text-left prose-table:border-collapse",
        "[&_thead_tr]:border-0 [&_tbody_tr]:border-0",
        "prose-th:fw-medium prose-th:text-tertiary prose-th:text-[11px] prose-th:text-left prose-th:align-bottom prose-th:pb-2 prose-th:pt-0",
        "prose-td:text-primary prose-td:align-top prose-td:py-3",
        "[&_th]:border-b [&_th]:border-primary [&_td]:border-b [&_td]:border-primary",
        "[&_th]:pr-6 [&_td]:pr-6 [&_th:first-child]:pl-0 [&_td:first-child]:pl-0 [&_th:last-child]:pr-0 [&_td:last-child]:pr-0",
        "prose-code:text-secondary prose-code:text-xs prose-code:font-mono",
        "prose-code:before:content-none prose-code:after:content-none",
        "[&_:not(pre)>code]:bg-surface-tertiary [&_:not(pre)>code]:rounded-[4px] [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5",
        // Written as [&_pre] rather than prose-pre: so it outranks the typography plugin's own
        // `pre` rule, whose :where() wrapper leaves it at the same specificity — the plugin ships
        // light-on-dark defaults, which on this surface would be near-invisible.
        // Outline, not a border: it lands on the block's own pixels, so a long line scrolling
        // underneath it doesn't shift the box by a pixel. An elevated card would lift a code
        // block off the column it belongs to.
        "[&_pre]:bg-surface-secondary [&_pre]:text-secondary [&_pre]:rounded-sm [&_pre]:my-6",
        "[&_pre]:outline [&_pre]:-outline-offset-1 [&_pre]:outline-black/5 dark:[&_pre]:outline-white/8",
        "[&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:text-xs [&_pre]:leading-relaxed",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit",
        "md:prose-img:max-w-xl",
      ],
    },
  },
});
