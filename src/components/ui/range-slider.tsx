import { cn } from "@/lib/utils";
import { InputHTMLAttributes, PointerEvent, forwardRef, useEffect, useState } from "react";

interface RangeSliderProps extends InputHTMLAttributes<HTMLInputElement> {
  onGrabbingChange?: (grabbing: boolean) => void;
}

export const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(function RangeSlider(
  { className, disabled, onPointerDown, onGrabbingChange, ...props },
  ref,
) {
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    onGrabbingChange?.(grabbing);
    if (!grabbing) return;
    const release = () => setGrabbing(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [grabbing, onGrabbingChange]);

  return (
    <input
      ref={ref}
      type="range"
      disabled={disabled}
      onPointerDown={(e: PointerEvent<HTMLInputElement>) => {
        setGrabbing(true);
        onPointerDown?.(e);
      }}
      className={cn(
        "w-full h-[3px] appearance-none rounded-full outline-none bg-surface-tertiary",
        grabbing ? "cursor-grabbing" : "cursor-grab",
        disabled && "opacity-50 cursor-not-allowed",
        "[&::-webkit-slider-thumb]:appearance-none",
        "[&::-webkit-slider-thumb]:w-3",
        "[&::-webkit-slider-thumb]:h-3",
        "[&::-webkit-slider-thumb]:rounded-full",
        "[&::-webkit-slider-thumb]:bg-[var(--text-quaternary)]",
        "[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_var(--bg-primary)]",
        "[&::-webkit-slider-thumb]:transition-transform",
        "[&::-webkit-slider-thumb]:duration-300",
        "[&::-webkit-slider-thumb]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
        grabbing ? "[&::-webkit-slider-thumb]:scale-75" : "[&::-webkit-slider-thumb]:scale-100",
        "[&::-moz-range-thumb]:w-3",
        "[&::-moz-range-thumb]:h-3",
        "[&::-moz-range-thumb]:rounded-full",
        "[&::-moz-range-thumb]:bg-[var(--text-quaternary)]",
        "[&::-moz-range-thumb]:border-[2px]",
        "[&::-moz-range-thumb]:border-solid",
        "[&::-moz-range-thumb]:[border-color:var(--bg-primary)]",
        "[&::-moz-range-thumb]:transition-transform",
        "[&::-moz-range-thumb]:duration-300",
        "[&::-moz-range-thumb]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
        grabbing ? "[&::-moz-range-thumb]:scale-75" : "[&::-moz-range-thumb]:scale-100",
        className,
      )}
      {...props}
    />
  );
});
