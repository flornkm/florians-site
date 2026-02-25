import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Toggle from "@/components/ui/toggle";

const SECTIONS = [
  { id: "intro", label: "Introduction", lines: [80, 45] },
  { id: "design", label: "Design", lines: [60] },
  { id: "engineering", label: "Engineering", lines: [90, 60, 35] },
  { id: "craft", label: "Craft", lines: [60] },
  { id: "motion", label: "Motion", lines: [80, 45] },
  { id: "systems", label: "Systems", lines: [70, 50] },
  { id: "details", label: "Details", lines: [55] },
  { id: "closing", label: "Closing", lines: [75, 40] },
];

const SECTION_CONTENT: Record<string, string> = {
  intro:
    "Good interfaces feel inevitable. They don't demand attention, they reward it. The best products feel like they were always there.",
  design:
    "Hierarchy is the foundation. Without it, nothing communicates. With it, everything is clear.",
  engineering:
    "The best code disappears. It becomes the experience itself, invisible and seamless. Every abstraction should earn its place.",
  craft:
    "Craft is the difference between something that works and something that feels right.",
  motion:
    "Animation is not decoration. It is the language of state change, of spatial continuity. It guides attention.",
  systems:
    "A system is a set of constraints that makes the next thousand decisions easier. Consistency compounds.",
  details:
    "The details are not details. They make the product. Every pixel is a choice.",
  closing:
    "Ship it. Then make it better. Then make it better again. Momentum matters more than perfection.",
};

function useScrollState(containerRef: React.RefObject<HTMLElement | null>) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
  const lastScrollTop = useRef(0);
  const dirRef = useRef<"down" | "up">("down");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onScroll() {
      const container = containerRef.current;
      if (!container) return;
      const st = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const progress = maxScroll > 0 ? st / maxScroll : 0;
      setScrollProgress(progress);

      const dir = st >= lastScrollTop.current ? "down" : "up";
      dirRef.current = dir;
      setScrollDirection(dir);
      lastScrollTop.current = st;
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  return { scrollProgress, scrollDirection, dirRef };
}

function useActiveSection(
  containerRef: React.RefObject<HTMLElement | null>,
  trackDirection: boolean,
  dirRef: React.MutableRefObject<"down" | "up">,
) {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setActiveId(SECTIONS[0].id);

    if (!trackDirection) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const id = entry.target.getAttribute("data-section-id");
            if (id) setActiveId(id);
          }
        },
        {
          root: container,
          rootMargin: "-70% 0px 0px 0px",
          threshold: 0,
        },
      );

      container.querySelectorAll("[data-section-id]").forEach((el) => {
        observer.observe(el);
      });

      return () => {
        observer.disconnect();
      };
    }

    function createObserver(direction: "down" | "up") {
      const margin =
        "-40% 0px -40% 0px";

      return new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            if (dirRef.current !== direction) continue;
            const id = entry.target.getAttribute("data-section-id");
            if (id) setActiveId(id);
          }
        },
        {
          root: container,
          rootMargin: margin,
          threshold: 0,
        },
      );
    }

    const downObserver = createObserver("down");
    const upObserver = createObserver("up");
    const sections = container.querySelectorAll("[data-section-id]");

    sections.forEach((el) => {
      downObserver.observe(el);
      upObserver.observe(el);
    });

    return () => {
      downObserver.disconnect();
      upObserver.disconnect();
    };
  }, [containerRef, trackDirection, dirRef]);

  return activeId;
}

const SPRING = { type: "spring" as const, stiffness: 500, damping: 35, mass: 0.4 };

function Minimap({
  activeId,
  scrollProgress,
  scrollDirection,
  trackDirection,
}: {
  activeId: string;
  scrollProgress: number;
  scrollDirection: "down" | "up";
  trackDirection: boolean;
}) {
  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId);
  const sectionHeight = 28;
  const gap = 6;
  const totalHeight =
    SECTIONS.length * sectionHeight + (SECTIONS.length - 1) * gap;
  const viewportRatio = 0.3;
  const viewportHeight = totalHeight * viewportRatio;
  const scrollableRange = totalHeight - viewportHeight;

  const baseTop = scrollProgress * scrollableRange;

  let observerTop: number;
  let bandSize: number;
  if (!trackDirection) {
    bandSize = viewportHeight * viewportRatio;
    observerTop = baseTop + (viewportHeight - bandSize);
  } else {
    bandSize = viewportHeight * 0.67;
    observerTop = baseTop + (viewportHeight - bandSize) / 2;
  }

  const arrowDirection = trackDirection ? scrollDirection : "down";

  return (
    <div
      className="relative flex flex-col"
      style={{ height: totalHeight, width: 64, gap }}
    >
      <motion.div
        className="absolute left-0 right-0 rounded-[3px]"
        style={{
          height: viewportHeight,
          backgroundColor: "var(--bg-tertiary)",
          opacity: 0.6,
        }}
        animate={{ top: baseTop }}
        transition={{ type: "spring", stiffness: 600, damping: 45, mass: 0.4 }}
      />

      <motion.div
        className="absolute left-0 right-0 rounded-[3px] border flex items-center justify-center overflow-hidden"
        style={{ height: bandSize }}
        animate={{
          top: observerTop,
          borderColor: "var(--border-secondary)",
          backgroundColor: "var(--bg-quaternary)",
          opacity: 0.8,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.5 }}
      >
        <motion.svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className="text-tertiary"
          animate={{ rotate: arrowDirection === "up" ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 35, mass: 0.3 }}
        >
          <path
            d="M4 1.5L4 6.5M4 6.5L1.5 4M4 6.5L6.5 4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </motion.svg>
      </motion.div>

      {SECTIONS.map((section, i) => {
        const isActive = section.id === activeId;
        const isPast = i < activeIndex;

        return (
          <div
            key={section.id}
            className="relative z-10 flex flex-col justify-center gap-[3px] shrink-0"
            style={{ height: sectionHeight }}
          >
            {section.lines.map((width, li) => (
              <motion.div
                key={li}
                className="rounded-full"
                style={{ height: 2, width: `${width}%` }}
                animate={{
                  backgroundColor: isActive
                    ? "var(--text-quaternary)"
                    : isPast
                      ? "var(--text-quaternary)"
                      : "var(--border-primary)",
                  opacity: isActive ? 0.7 : isPast ? 0.5 : 0.25,
                }}
                transition={SPRING}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function ScrollDirectionDemo() {
  const [trackDirection, setTrackDirection] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollProgress, scrollDirection, dirRef } =
    useScrollState(containerRef);
  const activeId = useActiveSection(containerRef, trackDirection, dirRef);

  const activeLabel = SECTIONS.find((s) => s.id === activeId)?.label ?? "";
  const arrowDirection = trackDirection ? scrollDirection : "down";

  const totalHeight = SECTIONS.length * 28 + (SECTIONS.length - 1) * 6;
  const viewportH = totalHeight * 0.3;
  const labelTop = scrollProgress * (totalHeight - viewportH) + viewportH / 2;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl px-4">
      <div className="flex gap-6 w-full" style={{ height: 420 }}>
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
          }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              data-section-id={section.id}
              className="flex flex-col justify-center px-6 py-20"
              style={{ minHeight: "55%" }}
            >
              <h3 className="text-base font-medium text-secondary">
                {section.label}
              </h3>
              <p className="mt-2 text-sm text-quaternary leading-relaxed max-w-[300px]">
                {SECTION_CONTENT[section.id]}
              </p>
            </div>
          ))}
        </div>

        <div className="relative flex items-start gap-3 shrink-0">
          <Minimap
            activeId={activeId}
            scrollProgress={scrollProgress}
            scrollDirection={scrollDirection}
            trackDirection={trackDirection}
          />

          <div
            className="relative"
            style={{
              width: 100,
              height: totalHeight,
            }}
          >
            <div
              className="absolute left-0"
              style={{
                top: labelTop,
                transform: "translateY(-50%)",
                transition: "top 0.15s ease-out",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeId}
                  className="whitespace-nowrap text-xs font-medium text-secondary"
                  initial={{
                    opacity: 0,
                    y: arrowDirection === "down" ? -4 : 4,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: arrowDirection === "down" ? 4 : -4,
                  }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {activeLabel}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <Toggle
          checked={trackDirection}
          onCheckedChange={setTrackDirection}
        />
        <span className="type-small text-tertiary">
          Track scroll direction
        </span>
      </label>
    </div>
  );
}
