import { cn } from "@/lib/utils";
import React from "react";

type ToggleProps = {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">;

export default function Toggle({ checked, onCheckedChange, className, ...props }: ToggleProps) {
  const handleToggle = () => onCheckedChange?.(!checked);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      {...props}
      className={cn("inline-flex items-center gap-4", className)}
    >
      <div
        className={cn(
          "p-0.5 transition-all cursor-pointer duration-200 ease-out relative w-8 rounded-full h-5",
          checked ? "bg-black dark:bg-white" : "bg-neutral-200 dark:bg-neutral-900",
        )}
      >
        <div
          className={cn(
            "size-4 rounded-full bg-white dark:bg-black transition-all duration-200 z-10 ease-out absolute top-1/2 -translate-y-1/2",
            checked ? "right-0.5" : "right-3.5 dark:bg-white",
          )}
        />
      </div>
    </button>
  );
}
