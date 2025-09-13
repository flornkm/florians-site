import { cn } from "@/lib/utils";
import React from "react";

export const Code = ({
  className,
  children,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLPreElement>>) => {
  return (
    <pre
      {...props}
      className={cn(
        "inline-block w-full overflow-auto rounded-[10px] border bg-neutral-50 border-neutral-200 py-1 px-2 text-sm leading-relaxed dark:bg-neutral-950 dark:border-neutral-800",
        typeof className === "string" ? className.replace(/(^|\s)bg-[^\s]+/g, "") : className,
      )}
    >
      <code className="block min-w-0 font-mono text-[0.9em]">{children}</code>
    </pre>
  );
};
