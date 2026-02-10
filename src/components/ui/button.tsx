import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "py-1.5 px-3 cursor-pointer rounded-lg transition-all duration-150 font-medium text-center disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent-primary text-ms text-accent-foreground hover:bg-accent-primary-hover",
        secondary: "bg-surface-tertiary text-ms text-text-primary hover:bg-interactive-active",
        tertiary: "text-text-tertiary text-ms hover:text-text-secondary hover:bg-interactive-hover",
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
