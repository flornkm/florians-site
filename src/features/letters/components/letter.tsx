import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { PostStamp } from "./post-stamp";

const letterVariants = cva(
  "aspect-a4 shrink-0 w-full shadow-xl shadow-black/[.03] h-64 md:h-80 active:cursor-grabbing mx-auto p-4 bg-surface border-primary rounded-xl border flex",
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
        className: "scale-100 shadow-xl shadow-black/[.03]",
      },
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

export const Letter = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> &
    VariantProps<typeof letterVariants> & {
      message: string;
      handle: string;
      signature: string | null;
      email?: string;
      createdAt?: string;
      showStamp?: boolean;
      /** Committed handle for the stamp — avoids re-rendering the WebGL canvas on every keystroke */
      stampHandle?: string;
    }
>((props, ref) => {
  const {
    message,
    handle,
    signature,
    isEmpty = false,
    variant = "display",
    isDragging = false,
    showStamp = true,
    stampHandle,
    email,
    createdAt,
    className,
    ...restProps
  } = props;

  const resolvedStampHandle = stampHandle ?? handle;

  return (
    <div
      ref={ref}
      className={letterVariants({ variant, isEmpty, isDragging, className })}
      {...restProps}
    >
      <div className="flex-1 max-w-1/2 flex flex-col h-full gap-2 pr-8">
        <div
          className={cn(
            "transition-all duration-300 w-full flex-1",
            message && "opacity-100",
            !message && "opacity-0",
          )}
        >
          <p className="text-sm max-w-xs">
            <span className="font-semibold">Dear Website,</span> <br />
            <span className="break-words">{message}</span>
          </p>
        </div>
        <div className={cn("flex items-end", handle && "opacity-100", !handle && "opacity-0")}>
          <p className="text-sm font-medium text-tertiary">Sincerely, @{handle}</p>
        </div>
        {variant === "display" && (email || createdAt) && (
          <div className="text-xs text-quaternary space-y-1">
            {email && <div>Email: {email}</div>}
            {createdAt && <div>Created: {new Date(createdAt).toLocaleString()}</div>}
          </div>
        )}
      </div>
      <div className="h-full shrink-0 w-px bg-border-primary" />
      <div className="flex-1 shrink-0 w-full flex flex-col items-end justify-between h-full">
        {resolvedStampHandle && showStamp && (
          <PostStamp handle={resolvedStampHandle} className="rotate-3" />
        )}
        {signature && (
          <div className="w-full max-w-[200px] mt-auto">
            <img src={signature} alt="Signature" className="w-full dark:invert" />
          </div>
        )}
      </div>
    </div>
  );
});

Letter.displayName = "Letter";
