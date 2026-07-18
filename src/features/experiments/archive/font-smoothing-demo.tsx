import Toggle from "@/components/ui/toggle";
import { useState } from "react";
import "./font-smoothing-demo.css";

export const FontSmoothing = () => {
  const [smoothed, setSmoothed] = useState(true);

  return (
    <div className="relative flex h-full w-full max-w-full flex-col items-center justify-center px-4 py-6">
      <div className={`${smoothed ? "fs-smoothed" : "fs-raw"} text-primary text-center`}>
        <p className="text-3xl sm:text-4xl font-semibold tracking-tight">The quick brown fox</p>
        <p className="text-base sm:text-lg mt-2 text-secondary">jumps over the lazy dog</p>
      </div>
      <label className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 select-none items-center gap-3 text-xs text-tertiary">
        <Toggle checked={smoothed} onCheckedChange={setSmoothed} />
        <span>Smoothed</span>
      </label>
    </div>
  );
};
