import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconChevronLeftSmall } from "central-icons/IconChevronLeftSmall";
import { IconChevronRightSmall } from "central-icons/IconChevronRightSmall";

import { useState } from "react";

export const CssCalculations = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2 flex items-center flex-col">
      <div className="relative flex h-56 overflow-hidden rounded border border-neutral-200">
        <div className="w-48 h-full" />
        <div
          className={cn(
            "transition-all duration-200 ease-out h-full bg-neutral-100 border-l border-l-neutral-200",
            open ? "w-48" : "w-0 opacity-0",
          )}
        />
        <Button
          onClick={() => {
            setOpen(!open);
          }}
          variant="secondary"
          className={cn(
            "p-1 rounded-full bg-white border shadow-black/[.03] hover:bg-neutral-50 border-neutral-200 absolute top-2 transition-all duration-200 ease-out",
            open ? "right-[calc(50%-1.3rem)] translate-x-1/2" : "right-2",
          )}
        >
          {open ? <IconChevronLeftSmall className="size-4" /> : <IconChevronRightSmall className="size-4" />}
        </Button>
      </div>
    </div>
  );
};
