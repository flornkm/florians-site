import Toggle from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const DepthInput = () => {
  const [depth, setDepth] = useState(true);
  const [value, setValue] = useState("");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 rounded-[inherit] px-6 text-primary">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something..."
        className={cn(
          "w-full max-w-md rounded-full px-5 py-3 -outline-offset-1 text-sm font-medium text-primary outline placeholder:text-quaternary",
          "ring-1 ring-black/5 transition-all duration-300 ease-out",
          depth
            ? "bg-tertiary/50 outline-white dark:outline-black shadow-md focus:ring-4 focus:ring-black/[0.03]"
            : "bg-primary outline-[rgb(255_255_255_/_0)] dark:outline-[rgb(0_0_0_/_0)] shadow-[0_17.54px_23.39px_0_rgba(0,0,0,0),0_9.4px_12.5px_0_rgba(0,0,0,0),0_5.25px_7px_0_rgba(0,0,0,0),0_2.79px_3.72px_-2px_rgba(0,0,0,0),0_1.16px_1.5px_0_rgba(0,0,0,0)]",
        )}
      />

      <Toggle checked={depth} onCheckedChange={setDepth} className="text-xs text-secondary">
        Depth
      </Toggle>
    </div>
  );
};
