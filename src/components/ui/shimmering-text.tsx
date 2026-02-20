"use client";

import React, { useMemo, useId } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface ShimmeringTextProps {
  text: string;
  duration?: number;
  delay?: number;
  repeat?: boolean;
  repeatDelay?: number;
  className?: string;
  spread?: number;
  color?: string;
  shimmerColor?: string;
}

export function ShimmeringText({
  text,
  duration = 2,
  delay = 0,
  repeat = true,
  repeatDelay = 0,
  className,
  spread = 2,
  color,
  shimmerColor,
}: ShimmeringTextProps) {
  const id = useId();
  const animationName = `shimmer-${id.replace(/:/g, "")}`;

  const dynamicSpread = useMemo(() => {
    return text.length * spread;
  }, [text, spread]);

  const totalDuration = duration + repeatDelay;

  const activePercent = repeat
    ? Math.round((duration / totalDuration) * 100)
    : 100;

  return (
    <>
      <style>{`
        @keyframes ${animationName} {
          0% { background-position: 100% center; }
          ${activePercent}% { background-position: 0% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
      <motion.span
        className={cn(
          "inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
          "[background-repeat:no-repeat,padding-box]",
          className
        )}
        style={
          {
            "--spread": `${dynamicSpread}px`,
            "--base-color": color || "var(--text-quaternary)",
            "--shimmer-color": shimmerColor || "var(--text-primary)",
            backgroundImage: `linear-gradient(90deg, transparent calc(50% - var(--spread)), var(--shimmer-color), transparent calc(50% + var(--spread))), linear-gradient(var(--base-color), var(--base-color))`,
            animation: `${animationName} ${totalDuration}s linear ${delay}s ${repeat ? "infinite" : "1"}`,
          } as React.CSSProperties
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ opacity: { duration: 0.3, delay } }}
      >
        {text}
      </motion.span>
    </>
  );
}
