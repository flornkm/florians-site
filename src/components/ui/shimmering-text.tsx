import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

export type TextShimmerProps = {
  children: string;
  className?: string;
  duration?: number;
  spread?: number;
  paused?: boolean;
};

function TextShimmerComponent({ children, className, duration = 2, spread = 2, paused = false }: TextShimmerProps) {
  const dynamicSpread = useMemo(() => children.length * spread, [children, spread]);

  const shimmerStyles: React.CSSProperties = {
    backgroundImage: paused
      ? "none"
      : `
      linear-gradient(
        90deg,
        var(--shimmer-base) 0%,
        var(--shimmer-base) calc(50% - ${dynamicSpread}px),
        var(--shimmer-highlight) 50%,
        var(--shimmer-base) calc(50% + ${dynamicSpread}px),
        var(--shimmer-base) 100%
      )
    `,
    backgroundSize: "300% 100%",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: paused ? "var(--shimmer-base)" : "transparent",
    color: "transparent",
    animation: paused ? "none" : `shimmer-sweep ${duration}s linear infinite`,
    transition: "color 0.3s ease",
  } as React.CSSProperties;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.shimmer-text {
  --shimmer-base: #a1a1aa;
  --shimmer-highlight: #000000;
}
@media (prefers-color-scheme: dark) {
  .shimmer-text {
    --shimmer-base: #71717a;
    --shimmer-highlight: #ffffff;
  }
}
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
      <p className={cn("shimmer-text", className)} style={shimmerStyles}>
        {children}
      </p>
    </>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
