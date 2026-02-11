import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconChevronLeftSmall } from "central-icons/IconChevronLeftSmall";
import { IconChevronRightSmall } from "central-icons/IconChevronRightSmall";

import { useState } from "react";

export const CssCalculations = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2 flex items-center flex-col">
      <div className="relative flex h-32 md:h-56 overflow-hidden rounded border border-primary">
        <div className="w-24 md:w-48 h-full" />
        <div
          className={cn(
            "transition-all duration-200 ease-out h-full bg-surface-tertiary border-l border-l-primary",
            open ? "w-24 md:w-48" : "w-0 opacity-0",
          )}
        />
        <Button
          onClick={() => {
            setOpen(!open);
          }}
          variant="secondary"
          className={cn(
            "p-1 rounded-full bg-primary border shadow-muted hover:bg-surface-secondary border-primary absolute top-2 transition-all duration-200 ease-out",
            open ? "right-[calc(50%-1.3rem)] translate-x-1/2" : "right-2",
          )}
        >
          {open ? <IconChevronLeftSmall className="size-4" /> : <IconChevronRightSmall className="size-4" />}
        </Button>
      </div>
    </div>
  );
};
