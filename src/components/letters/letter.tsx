import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const letterVariants = cva(
  "aspect-a4 shrink-0 w-full shadow-2xl shadow-black/5 active:cursor-grabbing mx-auto p-4 bg-white dark:bg-neutral-900 dark:border-neutral-800 rounded-xl border border-neutral-200 flex",
  {
    variants: {
      variant: {
        preview: "max-w-xs md:max-w-[450px] flex items-center justify-center",
        display: "max-w-xs md:max-w-[450px] transition-all duration-200",
      },
      isEmpty: {
        true: "",
        false: "",
      },
      isDragging: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "preview",
        isEmpty: true,
        className: "scale-95",
      },
      {
        variant: "preview",
        isEmpty: false,
        className: "scale-100 shadow-2xl shadow-black/5",
      },
      // Preview variant with smooth transitions when not dragging
      {
        variant: "preview",
        isDragging: false,
        className: "transition-all duration-300 ease-out",
      },
    ],
    defaultVariants: {
      variant: "display",
      isEmpty: false,
      isDragging: false,
    },
  },
);

const stampVariants = cva(
  "w-16 mr-4 transition-all pointer-events-none object-contain duration-300 delay-100 max-w-[35%] ease-out perspective-normal origin-bottom-left relative z-10 dark:invert dark:selection:bg-amber-500/25",
  {
    variants: {
      variant: {
        preview: "",
        display: "opacity-100 scale-100 rotate-4",
      },
      isEmpty: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "preview",
        isEmpty: true,
        className: "opacity-0 scale-105 shadow-2xl dark:shadow-white rotate-2",
      },
      {
        variant: "preview",
        isEmpty: false,
        className: "opacity-100 scale-100 rotate-4",
      },
    ],
    defaultVariants: {
      variant: "display",
      isEmpty: false,
    },
  },
);

export const Letter = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> &
    VariantProps<typeof letterVariants> & {
      message: string;
      handle: string;
      signature: string | null;
      email?: string;
      createdAt?: string;
    }
>((props, ref) => {
  const {
    message,
    handle,
    signature,
    isEmpty = false,
    variant = "display",
    isDragging = false,
    email,
    createdAt,
    className,
    ...restProps
  } = props;

  return (
    <div ref={ref} className={letterVariants({ variant, isEmpty, isDragging, className })} {...restProps}>
      <div className="flex-1 max-w-1/2 flex flex-col gap-2 pr-8">
        <div
          className={cn("transition-all duration-300 w-full flex-1", message && "opacity-100", !message && "opacity-0")}
        >
          <p className="text-ms max-w-xs">
            <span className="font-semibold">Dear Website,</span> <br />
            {message}
          </p>
        </div>
        <div className={cn("flex items-end", handle && "opacity-100", !handle && "opacity-0")}>
          <p className="text-ms font-medium text-neutral-500">
            Sincerely,{" "}
            <span className="inline-flex items-center gap-1 translate-y-[3px]">
              <span className="w-4 h-4 rounded-full border border-neutral-200 dark:border-neutral-700 relative">
                <img src={`https://unavatar.io/${handle}`} alt={handle} className="relative z-10 rounded-full" />
                <span className="absolute inset-0 animate-pulse" />
              </span>
              @{handle}
            </span>
          </p>
        </div>
        {variant === "display" && (email || createdAt) && (
          <div className="text-xs text-neutral-400 space-y-1">
            {email && <div>Email: {email}</div>}
            {createdAt && <div>Created: {new Date(createdAt).toLocaleString()}</div>}
          </div>
        )}
      </div>
      <div className="h-[calc(100%-2rem)] shrink-0 w-px bg-neutral-200 dark:bg-neutral-800" />
      <div className="flex-1 shrink-0 w-full flex flex-col items-end justify-between">
        <img src="/images/letters/letter-stamp.webp" alt="Stamp" className={stampVariants({ variant, isEmpty })} />
        {signature && (
          <div className="w-full max-w-[200px]">
            <img src={signature} alt="Signature" className="w-full dark:invert" />
          </div>
        )}
      </div>
    </div>
  );
});

Letter.displayName = "Letter";
