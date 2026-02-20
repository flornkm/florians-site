"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);

  const words = useMemo(() => children.split(/\s+/), [children]);

  const detectLines = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;

    const spans = el.querySelectorAll<HTMLSpanElement>("span");
    if (spans.length === 0) return;

    const grouped: string[][] = [];
    let currentTop: number | null = null;
    let currentGroup: string[] = [];

    spans.forEach((span) => {
      const top = Math.round(span.getBoundingClientRect().top);
      if (currentTop === null || Math.abs(top - currentTop) > 2) {
        if (currentGroup.length > 0) grouped.push(currentGroup);
        currentGroup = [span.textContent || ""];
        currentTop = top;
      } else {
        currentGroup.push(span.textContent || "");
      }
    });

    if (currentGroup.length > 0) grouped.push(currentGroup);

    const newLines = grouped.map((g) => g.join(" "));
    setLines((prev) => {
      if (
        prev.length === newLines.length &&
        prev.every((l, i) => l === newLines[i])
      )
        return prev;
      return newLines;
    });
  }, []);

  useLayoutEffect(() => {
    detectLines();
  }, [children, detectLines]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => detectLines());
    observer.observe(el);
    return () => observer.disconnect();
  }, [detectLines]);

  const lineCount = lines.length || 1;
  const totalCycle = duration * lineCount;

  const keyframesCSS = useMemo(() => {
    if (lines.length <= 1) {
      return `
@keyframes shimmer-line-0 {
  0% { background-position: 100% center; }
  100% { background-position: 0% center; }
}`;
    }

    let css = "";
    for (let i = 0; i < lines.length; i++) {
      const slotStart = ((i / lineCount) * 100).toFixed(2);
      const slotEnd = (((i + 1) / lineCount) * 100).toFixed(2);

      if (i === 0) {
        css += `
@keyframes shimmer-line-${i} {
  0% { background-position: 100% center; }
  ${slotEnd}% { background-position: 0% center; }
  ${slotEnd}% { background-position: 0% center; }
  100% { background-position: 0% center; }
}`;
      } else if (i === lines.length - 1) {
        css += `
@keyframes shimmer-line-${i} {
  0% { background-position: 100% center; }
  ${slotStart}% { background-position: 100% center; }
  100% { background-position: 0% center; }
}`;
      } else {
        css += `
@keyframes shimmer-line-${i} {
  0% { background-position: 100% center; }
  ${slotStart}% { background-position: 100% center; }
  ${slotEnd}% { background-position: 0% center; }
  100% { background-position: 0% center; }
}`;
      }
    }
    return css;
  }, [lines.length, lineCount]);

  return (
    <div ref={containerRef} className="relative">
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />

      <div
        ref={measureRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none invisible absolute inset-x-0 top-0",
          className
        )}
      >
        {words.map((word, i) => (
          <span key={i} style={{ whiteSpace: "nowrap" }}>
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>

      <div
        className={cn(className)}
        style={{ visibility: lines.length > 0 ? "visible" : "hidden" }}
      >
        {lines.map((line, i) => {
          const dynamicSpread = line.length * spread;

          return (
            <div
              key={`${i}-${line.slice(0, 10)}`}
              style={{
                backgroundImage: `linear-gradient(90deg, transparent calc(50% - ${dynamicSpread}px), #000, transparent calc(50% + ${dynamicSpread}px)), linear-gradient(#a1a1aa, #a1a1aa)`,
                backgroundSize: "250% 100%",
                backgroundRepeat: "no-repeat, padding-box",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                animation: `shimmer-line-${i} ${totalCycle}s linear infinite`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
