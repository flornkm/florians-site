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
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);

  const detectLines = useCallback(() => {
    const measureEl = measureRef.current;
    if (!measureEl) return;

    const spans = measureEl.querySelectorAll<HTMLSpanElement>(
      "[data-shimmer-word]"
    );
    if (spans.length === 0) return;

    const grouped: string[][] = [];
    let currentLineTop: number | null = null;
    let currentGroup: string[] = [];

    spans.forEach((span) => {
      const top = Math.round(span.offsetTop);
      if (currentLineTop === null || top !== currentLineTop) {
        if (currentGroup.length > 0) {
          grouped.push(currentGroup);
        }
        currentGroup = [span.textContent || ""];
        currentLineTop = top;
      } else {
        currentGroup.push(span.textContent || "");
      }
    });

    if (currentGroup.length > 0) {
      grouped.push(currentGroup);
    }

    const newLines = grouped.map((words) => words.join(" "));
    setLines((prev) => {
      if (
        prev.length === newLines.length &&
        prev.every((l, i) => l === newLines[i])
      ) {
        return prev;
      }
      return newLines;
    });
  }, []);

  useLayoutEffect(() => {
    detectLines();
  }, [children, detectLines]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      detectLines();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [detectLines]);

  const words = useMemo(() => children.split(/\s+/), [children]);

  const lineCount = Math.max(lines.length, 1);
  const totalDuration = duration * lineCount;

  const keyframes = useMemo(() => {
    if (lines.length === 0) return "";

    let css = "";
    for (let i = 0; i < lines.length; i++) {
      const slotStart = (i / lineCount) * 100;
      const slotEnd = ((i + 1) / lineCount) * 100;

      css += `
@keyframes shimmer-line-${i}-of-${lineCount} {
  0% { background-position: 100% center; }
  ${slotStart}% { background-position: 100% center; }
  ${slotEnd}% { background-position: 0% center; }
  100% { background-position: 0% center; }
}`;
    }
    return css;
  }, [lines.length, lineCount]);

  return (
    <div ref={containerRef} className="relative">
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />

      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          top: 0,
          left: 0,
          right: 0,
          whiteSpace: "normal",
          wordBreak: "break-word",
        }}
        className={className}
      >
        {words.map((word, i) => (
          <span key={i} data-shimmer-word="" style={{ whiteSpace: "nowrap" }}>
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>

      <Component
        className={cn(className)}
        style={{ visibility: lines.length > 0 ? "visible" : "hidden" }}
      >
        {lines.map((line, lineIndex) => {
          const dynamicSpread = line.length * spread;

          return (
            <React.Fragment key={lineIndex}>
              <span
                style={{
                  display: "inline",
                  backgroundImage: `linear-gradient(90deg, transparent calc(50% - ${dynamicSpread}px), currentColor, transparent calc(50% + ${dynamicSpread}px)), linear-gradient(transparent, transparent)`,
                  backgroundSize: "250% 100%",
                  backgroundRepeat: "no-repeat, padding-box",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  animation: `shimmer-line-${lineIndex}-of-${lineCount} ${totalDuration}s linear infinite`,
                }}
              >
                {line}
              </span>
              {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
          );
        })}
      </Component>
    </div>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
