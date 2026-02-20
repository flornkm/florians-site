"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

export type TextShimmerProps = {
  children: string;
  className?: string;
  duration?: number;
  spread?: number;
};

function TextShimmerComponent({
  children,
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const dynamicSpread = useMemo(
    () => children.length * spread,
    [children, spread]
  );

  const shimmerStyles: React.CSSProperties = {
    backgroundImage: `
      linear-gradient(
        90deg,
        #a1a1aa 0%,
        #a1a1aa calc(50% - ${dynamicSpread}px),
        #000 50%,
        #a1a1aa calc(50% + ${dynamicSpread}px),
        #a1a1aa 100%
      )
    `,
    backgroundSize: "300% 100%",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    animation: `shimmer-sweep ${duration}s linear infinite`,
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes shimmer-sweep {
  0% {
    background-position: 100% center;
  }
  100% {
    background-position: 0% center;
  }
}`,
        }}
      />
      <p className={cn(className)} style={shimmerStyles}>
        {children}
      </p>
    </>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
