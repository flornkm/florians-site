import { Body3, Body4 } from "@/components/design-system/body";
import Button from "@/components/ui/button";
import Toggle from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { IconChevronLeftSmall } from "central-icons/IconChevronLeftSmall";
import { useState } from "react";

export const ButtonAlignment = () => {
  const [align, setAlign] = useState(false);

  return (
    <div className="space-y-2 flex items-center flex-col">
      <Button variant="secondary" className={cn("flex items-center gap-1", align && "pl-1.5")}>
        <IconChevronLeftSmall className="size-4" />
        Go back
      </Button>
      <div className={cn("transition-all duration-200 ease-out", align ? "w-[94px]" : "w-[100px]")}>
        <div className="flex justify-between">
          <div className="flex justify-start flex-col items-start relative">
            <div
              className={cn(
                "flex justify-end bg-red-100 dark:bg-red-950 rounded transition-all duration-200 ease-out",
                align ? "gap-1.5" : "gap-3",
              )}
            >
              <div className="h-4 w-px bg-rose-400 dark:bg-rose-500" />
              <div className="h-4 w-px bg-rose-400 dark:bg-rose-500" />
            </div>
            <Body4
              className={cn(
                "text-primary mt-1 transition-all duration-200 ease-out w-6",
                align ? "-translate-x-2" : "-translate-x-1",
              )}
            >
              <NumberFlow value={align ? 1.5 : 3} prefix={"pl-"} />
            </Body4>
          </div>
          <div className="flex justify-start flex-col items-end relative">
            <div className="flex justify-end bg-red-100 dark:bg-red-950 gap-3 rounded">
              <div className="h-4 w-px bg-rose-400 dark:bg-rose-500" />
              <div className="h-4 w-px bg-rose-400 dark:bg-rose-500" />
            </div>
            <Body4 className="text-primary mt-1 translate-x-2">pr-3</Body4>
          </div>
        </div>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Body3>Optical alignment</Body3>
        <Toggle checked={align} onCheckedChange={setAlign} aria-label="Visually align" />
      </div>
    </div>
  );
};
