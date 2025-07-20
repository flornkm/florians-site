import { cn } from "@/lib/utils";
import React from "react";

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  content: string;
  className?: string;
}

export default function Tooltip({ children, content, className, ...props }: TooltipProps) {
  return (
    <div className={cn("relative group/tooltip", className)} {...props}>
      {children}
      <div className="absolute bottom-full mb-1 group-hover/tooltip:mb-2 left-1/2 pointer-events-none font-medium -translate-x-1/2 text-xs dark:bg-white dark:text-black bg-black text-white px-2 py-1 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 delay-75">
        <span className="truncate">{content}</span>
        <div className="w-2 h-2 bg-black dark:bg-white -translate-y-1/2 rounded-[2px] -mt-px rotate-45 absolute top-full left-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}
