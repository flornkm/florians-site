import Toggle from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const DepthInput = () => {
  const [depth, setDepth] = useState(true);
  const [value, setValue] = useState("");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 rounded-[inherit] bg-primary px-6 text-primary">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something..."
        className={cn(
          "w-full max-w-md ring-transparent rounded-full bg-transparent px-5 py-3 -outline-offset-2 text-sm font-medium text-primary outline placeholder:text-quaternary",
          "border transition-all duration-300 ease-out",
          depth
            ? "border-primary focus-visible:ring-primary/5 bg-tertiary/85 outline-white dark:outline-black shadow-sm ring-0 focus:ring-4 focus:ring-primary/15"
            : "border-primary bg-primary shadow-none outline-transparent ring-0",
        )}
      />

      <Toggle checked={depth} onCheckedChange={setDepth} className="text-xs text-secondary">
        Depth
      </Toggle>
    </div>
  );
};
