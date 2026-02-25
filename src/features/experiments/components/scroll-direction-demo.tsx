import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SECTIONS = [
  { id: "intro", label: "Introduction", lines: 3 },
  { id: "design", label: "Design", lines: 2 },
  { id: "engineering", label: "Engineering", lines: 4 },
  { id: "craft", label: "Craft", lines: 2 },
  { id: "motion", label: "Motion", lines: 3 },
  { id: "systems", label: "Systems", lines: 3 },
  { id: "details", label: "Details", lines: 2 },
  { id: "closing", label: "Closing", lines: 3 },
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

function useActiveSection(
  containerRef: React.RefObject<HTMLElement | null>,
  trackDirection: boolean,
) {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const scrollDirRef = useRef<"down" | "up">("down");
  const lastScrollTop = useRef(0);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const st = el.scrollTop;
    scrollDirRef.current = st >= lastScrollTop.current ? "down" : "up";
    lastScrollTop.current = st;
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setActiveId(SECTIONS[0].id);
    lastScrollTop.current = container.scrollTop;
    container.addEventListener("scroll", handleScroll, { passive: true });

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
        container.removeEventListener("scroll", handleScroll);
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
            if (scrollDirRef.current !== direction) continue;
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
      container.removeEventListener("scroll", handleScroll);
      downObserver.disconnect();
      upObserver.disconnect();
    };
  }, [containerRef, trackDirection, handleScroll]);

  return activeId;
}

const SKELETON_WIDTHS: Record<number, number[]> = {
  2: [100, 60],
  3: [100, 80, 45],
  4: [100, 90, 75, 35],
};

function Minimap({
  activeId,
  trackDirection,
}: {
  activeId: string;
  trackDirection: boolean;
}) {
  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId);
  const sectionHeight = 28;
  const gap = 6;
  const totalHeight = SECTIONS.length * sectionHeight + (SECTIONS.length - 1) * gap;
  const viewportHeight = totalHeight * 0.3;

  const observerTop = trackDirection
    ? activeIndex * (sectionHeight + gap)
    : totalHeight - viewportHeight;

  return (
    <div
      className="relative flex flex-col"
      style={{ height: totalHeight, width: 44, gap }}
    >
      <motion.div
        className="absolute left-0 right-0 rounded-[4px] border border-secondary bg-interactive-hover"
        style={{ height: viewportHeight }}
        animate={{ top: observerTop }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 38,
          mass: 0.6,
        }}
      />

      {SECTIONS.map((section, i) => {
        const isActive = section.id === activeId;
        const isPast = i < activeIndex;
        const lines = SKELETON_WIDTHS[section.lines] ?? [100, 70];

        return (
          <div
            key={section.id}
            className="relative flex flex-col justify-center gap-[3px] shrink-0"
            style={{ height: sectionHeight }}
          >
            {lines.map((width, li) => (
              <motion.div
                key={li}
                className="rounded-full"
                style={{ height: 2, width: `${width}%` }}
                animate={{
                  backgroundColor: isActive
                    ? "var(--text-primary)"
                    : isPast
                      ? "var(--text-quaternary)"
                      : "var(--border-primary)",
                  opacity: isActive ? 1 : isPast ? 0.6 : 0.35,
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
  const activeId = useActiveSection(containerRef, trackDirection);

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
          <Minimap activeId={activeId} trackDirection={trackDirection} />
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
            ? "The observer viewport follows the scroll direction. Sections highlight as they enter from either edge."
            : "The observer is stuck at the bottom. Scroll up and notice how late it takes to pick up the previous section."}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
