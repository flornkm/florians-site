"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

export type TextShimmerProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

function TextShimmerComponent({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes text-shimmer{0%{background-position:100% center}to{background-position:0% center}}`,
        }}
      />
      <Component
        className={cn(
          "relative inline-block bg-[length:250%_100%,auto] bg-clip-text",
          "text-transparent [--base-color:transparent] [--base-gradient-color:#a1a1aa]",
          "[background-repeat:no-repeat,padding-box]",
          "dark:[--base-gradient-color:#71717a]",
          className
        )}
        style={
          {
            "--spread": `${dynamicSpread}px`,
            backgroundImage: `linear-gradient(90deg, #0000 calc(50% - var(--spread)), var(--base-gradient-color), #0000 calc(50% + var(--spread))), linear-gradient(var(--base-color), var(--base-color))`,
            animation: `text-shimmer ${duration}s linear infinite`,
          } as React.CSSProperties
        }
      >
        {children}
      </Component>
    </>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
