"use client";

import React, { useMemo } from "react";

export type TextShimmerProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
  stagger?: number;
};

function TextShimmerComponent({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
  stagger = 0.08,
}: TextShimmerProps) {
  const words = useMemo(() => children.split(" "), [children]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes word-shimmer {
  0% { background-position: 100% center; }
  100% { background-position: 0% center; }
}
`,
        }}
      />
      <Component className={className}>
        {words.map((word, i) => {
          const wordSpread = word.length * spread;
          const shimmerGradient = `linear-gradient(90deg, transparent calc(50% - ${wordSpread}px), #a1a1aa, transparent calc(50% + ${wordSpread}px))`;
          const baseGradient = `linear-gradient(transparent, transparent)`;

          return (
            <React.Fragment key={i}>
              <span
                style={{
                  display: "inline",
                  backgroundImage: `${shimmerGradient}, ${baseGradient}`,
                  backgroundSize: "250% 100%, auto",
                  backgroundRepeat: "no-repeat, padding-box",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  animation: `word-shimmer ${duration}s linear infinite`,
                  animationDelay: `${i * stagger}s`,
                }}
              >
                {word}
              </span>
              {i < words.length - 1 ? " " : ""}
            </React.Fragment>
          );
        })}
      </Component>
    </>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
