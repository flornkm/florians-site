import { useState } from "react";
import { TextShimmer } from "../text-shimmer";

const SAMPLE_TEXT =
  "I found 3 flights matching your criteria. The best option departs at 9:45 AM with a layover in Denver, arriving by 4:30 PM local time. Would you like me to book it?";

const MIN_DURATION = 0.5;
const MAX_DURATION = 5;
const DEFAULT_SPEED = 3.5;

export const TextShimmerDemo = () => {
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const duration = MIN_DURATION + MAX_DURATION - speed;

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-md px-6">
      <div className="w-full">
        <TextShimmer key={duration} className="text-ms leading-relaxed" duration={duration}>
          {SAMPLE_TEXT}
        </TextShimmer>
      </div>

      <div className="flex items-center gap-3 w-full max-w-[240px]">
        <span className="text-xs text-quaternary shrink-0">Slow</span>
        <input
          type="range"
          min={MIN_DURATION}
          max={MAX_DURATION}
          step={0.1}
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full h-[3px] appearance-none bg-surface-tertiary rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-quaternary [&::-webkit-slider-thumb]:hover:bg-interactive-active [&::-webkit-slider-thumb]:transition-colors [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-quaternary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:hover:bg-interactive-active [&::-moz-range-thumb]:transition-colors"
        />
        <span className="text-xs text-quaternary shrink-0">Fast</span>
      </div>
    </div>
  );
};
