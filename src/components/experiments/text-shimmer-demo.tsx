import { useState, useRef, useEffect } from "react";
import { TextShimmer } from "../text-shimmer";

const SAMPLE_TEXT =
  "I found 3 flights matching your criteria. The best option departs at 9:45 AM with a layover in Denver, arriving by 4:30 PM local time. Would you like me to book it?";

const MIN_SPEED = 0.5;
const MAX_SPEED = 5;
const DEFAULT_SPEED = 3.5;

export const TextShimmerDemo = () => {
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [grabbing, setGrabbing] = useState(false);
  const [shimmerKey, setShimmerKey] = useState(0);
  const committedSpeed = useRef(speed);
  const duration = MIN_SPEED + MAX_SPEED - speed;

  useEffect(() => {
    if (!grabbing) return;
    const onUp = () => {
      setGrabbing(false);
      setShimmerKey((k) => k + 1);
      committedSpeed.current = speed;
    };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, [grabbing, speed]);

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-md px-6">
      <div className="w-full">
        <TextShimmer
          key={shimmerKey}
          className="text-ms leading-relaxed [--base-color:#d4d4d4] [--base-gradient-color:#171717] dark:[--base-color:#404040] dark:[--base-gradient-color:#e5e5e5]"
          duration={duration}
          spread={3}
        >
          {SAMPLE_TEXT}
        </TextShimmer>
      </div>

      <div className="flex items-center gap-3 w-full max-w-[240px]">
        <span className="text-xs text-quaternary shrink-0 select-none">
          Slow
        </span>
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min={MIN_SPEED}
            max={MAX_SPEED}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            onPointerDown={() => setGrabbing(true)}
            className={[
              "w-full h-[3px] appearance-none rounded-full outline-none bg-surface-tertiary",
              grabbing ? "cursor-grabbing" : "cursor-grab",
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:w-3",
              "[&::-webkit-slider-thumb]:h-3",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-[var(--text-quaternary)]",
              "[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_var(--bg-primary)]",
              "[&::-webkit-slider-thumb]:transition-transform",
              "[&::-webkit-slider-thumb]:duration-300",
              "[&::-webkit-slider-thumb]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
              grabbing
                ? "[&::-webkit-slider-thumb]:scale-75"
                : "[&::-webkit-slider-thumb]:scale-100",
              grabbing
                ? "[&::-webkit-slider-thumb]:cursor-grabbing"
                : "[&::-webkit-slider-thumb]:cursor-grab",
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
              grabbing
                ? "[&::-moz-range-thumb]:scale-75"
                : "[&::-moz-range-thumb]:scale-100",
              grabbing
                ? "[&::-moz-range-thumb]:cursor-grabbing"
                : "[&::-moz-range-thumb]:cursor-grab",
            ].join(" ")}
          />
        </div>
        <span className="text-xs text-quaternary shrink-0 select-none">
          Fast
        </span>
      </div>
    </div>
  );
};
