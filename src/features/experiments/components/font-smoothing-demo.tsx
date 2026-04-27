import Toggle from "@/components/ui/toggle";
import { useState } from "react";
import "./font-smoothing-demo.css";

export const FontSmoothing = () => {
  const [smoothed, setSmoothed] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full max-w-full px-4 py-6">
      <div className={`${smoothed ? "fs-smoothed" : "fs-raw"} text-primary text-center`}>
        <p className="text-3xl sm:text-4xl font-semibold tracking-tight">The quick brown fox</p>
        <p className="text-base sm:text-lg mt-2 text-secondary">jumps over the lazy dog</p>
      </div>
      <label className="inline-flex items-center gap-3 text-xs text-tertiary select-none">
        <Toggle checked={smoothed} onCheckedChange={setSmoothed} />
        <span>Smoothed</span>
      </label>
    </div>
  );
};
