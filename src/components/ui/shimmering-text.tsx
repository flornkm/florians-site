"use client";

import React, { useMemo } from "react";

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

  const shimmerGradient = `linear-gradient(90deg, transparent calc(50% - ${dynamicSpread}px), #a1a1aa, transparent calc(50% + ${dynamicSpread}px))`;
  const baseGradient = `linear-gradient(transparent, transparent)`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes text-shimmer {
  0% { background-position: 100% center; }
  100% { background-position: 0% center; }
}
@media (prefers-color-scheme: dark) {
  .shimmer-text { --shimmer-color: #71717a !important; }
}
`,
        }}
      />
      <Component
        className={`shimmer-text ${className || ""}`}
        style={{
          display: "inline-block",
          position: "relative",
          backgroundImage: `${shimmerGradient}, ${baseGradient}`,
          backgroundSize: "250% 100%, auto",
          backgroundRepeat: "no-repeat, padding-box",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          animation: `text-shimmer ${duration}s linear infinite`,
        }}
      >
        {children}
      </Component>
    </>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
