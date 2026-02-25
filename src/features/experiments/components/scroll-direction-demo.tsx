import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SECTIONS = [
  { id: "intro", label: "Introduction", lines: 2 },
  { id: "design", label: "Design", lines: 1 },
  { id: "engineering", label: "Engineering", lines: 3 },
  { id: "craft", label: "Craft", lines: 1 },
  { id: "motion", label: "Motion", lines: 2 },
  { id: "systems", label: "Systems", lines: 2 },
  { id: "details", label: "Details", lines: 1 },
  { id: "closing", label: "Closing", lines: 2 },
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
        direction === "down" ? "-70% 0px 0px 0px" : "0px 0px -70% 0px";

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

const SKELETON_WIDTHS: Record<number, number[]> = {
  1: [60],
  2: [80, 45],
  3: [90, 60, 35],
};

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
  if (!trackDirection) {
    const bandSize = viewportHeight * viewportRatio;
    observerTop = baseTop + (viewportHeight - bandSize);
  } else {
    const bandSize = viewportHeight * viewportRatio;
    if (scrollDirection === "down") {
      observerTop = baseTop + (viewportHeight - bandSize);
    } else {
      observerTop = baseTop;
    }
  }

  const observerBandHeight = viewportHeight * viewportRatio;

  return (
    <div
      className="relative flex flex-col"
      style={{ height: totalHeight, width: 44, gap }}
    >
      <motion.div
        className="absolute left-0 right-0 rounded-[3px]"
        style={{
          height: viewportHeight,
          backgroundColor: "var(--bg-tertiary)",
          opacity: 0.6,
        }}
        animate={{ top: baseTop }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 45,
          mass: 0.4,
        }}
      />

      <motion.div
        className="absolute left-0 right-0 rounded-[3px] border"
        style={{ height: observerBandHeight }}
        animate={{
          top: observerTop,
          borderColor: trackDirection
            ? "var(--border-secondary)"
            : "var(--border-primary)",
          backgroundColor: "var(--bg-quaternary)",
          opacity: trackDirection ? 0.8 : 0.5,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 40,
          mass: 0.5,
        }}
      />

      {SECTIONS.map((section, i) => {
        const isActive = section.id === activeId;
        const isPast = i < activeIndex;
        const lines = SKELETON_WIDTHS[section.lines] ?? [100, 70];

        return (
          <div
            key={section.id}
            className="relative z-10 flex flex-col justify-center gap-[3px] shrink-0"
            style={{ height: sectionHeight }}
          >
            {lines.map((width, li) => (
              <motion.div
                key={li}
                className="rounded-full"
                style={{ height: 1.5, width: `${width}%` }}
                animate={{
                  backgroundColor: isActive
                    ? "var(--text-primary)"
                    : isPast
                      ? "var(--text-quaternary)"
                      : "var(--border-primary)",
                  opacity: isActive ? 1 : isPast ? 0.5 : 0.25,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                  mass: 0.4,
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function SectionBlock({ id, index }: { id: string; index: number }) {
  return (
    <div
      data-section-id={id}
      className="flex flex-col justify-center px-6 py-20"
      style={{ minHeight: "55%" }}
    >
      <p className="type-tiny text-quaternary mb-3 tabular-nums tracking-wide">
        {String(index + 1).padStart(2, "0")}
      </p>
      <p className="type-body text-secondary leading-relaxed max-w-[300px]">
        {SECTION_CONTENT[id]}
      </p>
    </div>
  );
}

export function ScrollDirectionDemo() {
  const [trackDirection, setTrackDirection] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollProgress, scrollDirection, dirRef } =
    useScrollState(containerRef);
  const activeId = useActiveSection(containerRef, trackDirection, dirRef);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md px-4">
      <label className="flex items-center gap-2.5 select-none cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={trackDirection}
            onChange={(e) => setTrackDirection(e.target.checked)}
            className="peer sr-only"
          />
          <motion.div
            className="w-8 h-[18px] rounded-full border transition-colors"
            animate={{
              backgroundColor: trackDirection
                ? "var(--text-primary)"
                : "var(--bg-tertiary)",
              borderColor: trackDirection
                ? "var(--text-primary)"
                : "var(--border-secondary)",
            }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            className="absolute top-[3px] rounded-full bg-primary shadow-sm"
            style={{ width: 12, height: 12 }}
            animate={{
              left: trackDirection ? 17 : 3,
              backgroundColor: trackDirection
                ? "var(--text-inverted)"
                : "var(--text-quaternary)",
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
            }}
          />
        </div>
        <span className="type-small text-tertiary group-hover:text-secondary transition-colors">
          Track scroll direction
        </span>
      </label>

      <div className="relative w-full">
        <div
          ref={containerRef}
          className="h-[380px] overflow-y-auto rounded-lg border border-primary"
        >
          <div className="divide-y divide-primary">
            {SECTIONS.map((section, i) => (
              <SectionBlock key={section.id} id={section.id} index={i} />
            ))}
          </div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Minimap
            activeId={activeId}
            scrollProgress={scrollProgress}
            scrollDirection={scrollDirection}
            trackDirection={trackDirection}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={trackDirection ? "on" : "off"}
          className="type-small text-quaternary text-center max-w-[320px] leading-relaxed"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {trackDirection
            ? "The observation band follows scroll direction — it shifts to the leading edge, picking up sections immediately."
            : "The observation band is always at the bottom. Scroll up and watch how it lags behind — sections highlight late."}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
