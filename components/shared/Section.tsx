import { cn } from "@/lib/utils";
import React from "react";

export default function Section({
  as: Component = "section",
  children,
  className,
  ...props
}: { as?: React.ElementType } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Component className={cn("w-full grid grid-cols-[336px_1fr] gap-4", className)} {...props}>
      {children}
    </Component>
  );
}
