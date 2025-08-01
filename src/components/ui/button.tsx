import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "py-1.5 px-3 cursor-pointer rounded-lg text-ms transition-all duration-150 font-medium text-center disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-black",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:text-white dark:hover:bg-neutral-900 dark:bg-neutral-900/75",
        tertiary:
          "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900/75 dark:hover:text-neutral-400",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export default function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "tertiary" },
) {
  return <button {...props} className={cn(buttonVariants({ variant: props.variant }), props.className)} />;
}
