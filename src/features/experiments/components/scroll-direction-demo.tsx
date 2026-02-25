import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Toggle from "@/components/ui/toggle";

const SECTIONS = [
  { id: "intro", label: "Introduction" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "color", label: "Color" },
  { id: "motion", label: "Motion" },
];

const SKELETON_LINES: Record<string, number[]> = {
  intro: [100, 75, 50],
  typography: [90, 60],
  spacing: [80, 65, 40],
  color: [70, 55],
  motion: [95, 70, 45],
};

const SPRING = { stiffness: 500, damping: 38, mass: 0.5 };

export function ScrollDirectionDemo() {
  const [trackDirection, setTrackDirection] = useState(false);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("down");
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    setActiveId(SECTIONS[0].id);
    setScrollProgress(0);
    setScrollDir("down");
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [trackDirection]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.scrollTop;
    const max = el.scrollHeight - el.clientHeight;
    setScrollProgress(max > 0 ? top / max : 0);
    const dir = top >= lastScrollTop.current ? "down" : "up";
    setScrollDir(dir);
    lastScrollTop.current = top;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const sectionEls = containerRef.current.querySelectorAll("[data-section]");
    if (!sectionEls.length) return;

    if (trackDirection) {
      const downObs = new IntersectionObserver(
        (entries) => {
          if (scrollDir !== "down") return;
          entries.forEach((e) => {
            if (e.isIntersecting) setActiveId(e.target.getAttribute("data-section")!);
          });
        },
        { root: containerRef.current, rootMargin: "-40% 0px -40% 0px", threshold: 0 }
      );
      const upObs = new IntersectionObserver(
        (entries) => {
          if (scrollDir !== "up") return;
          entries.forEach((e) => {
            if (e.isIntersecting) setActiveId(e.target.getAttribute("data-section")!);
          });
        },
        { root: containerRef.current, rootMargin: "-40% 0px -40% 0px", threshold: 0 }
      );
      sectionEls.forEach((el) => { downObs.observe(el); upObs.observe(el); });
      return () => { downObs.disconnect(); upObs.disconnect(); };
    } else {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActiveId(e.target.getAttribute("data-section")!);
          });
        },
        { root: containerRef.current, rootMargin: "-70% 0px 0px 0px", threshold: 0 }
      );
      sectionEls.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }
  }, [trackDirection, scrollDir]);

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId);

  const sectionH = 40;
  const gap = 4;
  const totalH = SECTIONS.length * sectionH + (SECTIONS.length - 1) * gap;
  const labelTop = scrollProgress * totalH * 0.7 + totalH * 0.15;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex items-center gap-3">
        <span className="text-sm text-secondary">Track scroll direction</span>
        <Toggle checked={trackDirection} onCheckedChange={setTrackDirection} />
      </div>

      <div className="flex items-start gap-8 w-full max-w-xl">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 relative overflow-y-auto rounded-xl bg-primary"
          style={{
            height: 400,
            scrollbarWidth: "none",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
          }}
        >
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              data-section={section.id}
              className="flex flex-col justify-center px-8 py-20"
              style={{ minHeight: "50%" }}
            >
              <p className="text-sm text-tertiary">{section.label}</p>
            </div>
          ))}
        </div>

        <div className="relative shrink-0" style={{ width: 80, height: totalH }}>
          {SECTIONS.map((section, i) => {
            const isActive = section.id === activeId;
            const top = i * (sectionH + gap);
            const lines = SKELETON_LINES[section.id] || [80, 60];
            const tint = isActive
              ? trackDirection
                ? "rgba(120, 200, 140, 0.15)"
                : "rgba(200, 130, 120, 0.15)"
              : "transparent";

            return (
              <div
                key={section.id}
                className="absolute left-0 right-0 rounded-md flex flex-col justify-center px-2.5 transition-colors duration-300"
                style={{
                  top,
                  height: sectionH,
                  backgroundColor: tint,
                }}
              >
                {lines.map((w, j) => (
                  <div
                    key={j}
                    className="rounded-full bg-quaternary transition-opacity duration-300"
                    style={{
                      height: 3,
                      width: `${w}%`,
                      marginTop: j > 0 ? 5 : 0,
                      opacity: isActive ? 0.4 : 0.1,
                    }}
                  />
                ))}
              </div>
            );
          })}

          <motion.div
            className="absolute left-full ml-4 whitespace-nowrap"
            animate={{ top: labelTop }}
            transition={SPRING}
            style={{ transform: "translateY(-50%)" }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={activeId}
                className="text-sm font-medium text-secondary block"
                initial={{ opacity: 0, y: scrollDir === "down" ? -4 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: scrollDir === "down" ? 4 : -4 }}
                transition={{ duration: 0.15 }}
              >
                {SECTIONS[activeIndex]?.label}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
