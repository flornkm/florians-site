import { RangeSlider } from "@/components/ui/range-slider";
import { TextShimmer } from "@/components/ui/shimmering-text";
import { useState } from "react";

const SAMPLE_TEXT = "Searching for the best flights to Denver...";

const MIN_SPEED = 0.5;
const MAX_SPEED = 5;
const DEFAULT_SPEED = 3.5;

export const TextShimmerExperiment = () => {
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [grabbing, setGrabbing] = useState(false);
  const duration = MIN_SPEED + MAX_SPEED - speed;

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-md px-6">
      <div className="w-full">
        <TextShimmer
          duration={duration}
          spread={2}
          paused={grabbing}
          className="text-sm leading-relaxed text-center"
        >
          {SAMPLE_TEXT}
        </TextShimmer>
      </div>

      <div className="flex items-center gap-3 w-full max-w-[240px]">
        <span className="text-xs text-quaternary shrink-0 select-none">Slow</span>
        <RangeSlider
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={0.1}
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.currentTarget.value))}
          onGrabbingChange={setGrabbing}
        />
        <span className="text-xs text-quaternary shrink-0 select-none">Fast</span>
      </div>
    </div>
  );
};
