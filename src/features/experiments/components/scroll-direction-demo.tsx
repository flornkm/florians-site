import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SECTIONS = [
  { id: "intro", label: "Introduction" },
  { id: "design", label: "Design" },
  { id: "engineering", label: "Engineering" },
  { id: "craft", label: "Craft" },
  { id: "motion", label: "Motion" },
  { id: "systems", label: "Systems" },
  { id: "details", label: "Details" },
  { id: "closing", label: "Closing" },
];

const SECTION_CONTENT: Record<string, string> = {
  intro: "Good interfaces feel inevitable. They don't demand attention, they reward it.",
  design: "Hierarchy is the foundation. Without it, nothing communicates. With it, everything is clear.",
  engineering: "The best code disappears. It becomes the experience itself, invisible and seamless.",
  craft: "Craft is the difference between something that works and something that feels right.",
  motion: "Animation is not decoration. It is the language of state change, of spatial continuity.",
  systems: "A system is a set of constraints that makes the next thousand decisions easier.",
  details: "The details are not details. They make the product. Every pixel is a choice.",
  closing: "Ship it. Then make it better. Then make it better again.",
};

function useScrollDirection(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollDirRef = useRef<"down" | "up">("down");
  const lastScrollTop = useRef(0);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const st = el.scrollTop;
    scrollDirRef.current = st > lastScrollTop.current ? "down" : "up";
    lastScrollTop.current = st;
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });

    observerRef.current = new IntersectionObserver(
      (entries) => {
        setActiveIds((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const id = entry.target.getAttribute("data-section-id");
            if (!id) return;

            if (enabled) {
              if (entry.isIntersecting) {
                next.add(id);
              } else {
                next.delete(id);
              }
            } else {
              if (entry.isIntersecting && scrollDirRef.current === "down") {
                next.add(id);
              }
              if (!entry.isIntersecting && scrollDirRef.current === "down") {
                // keep it
              }
              if (entry.isIntersecting && scrollDirRef.current === "up") {
                // naive: don't remove when scrolling up without tracking
              }
              if (!entry.isIntersecting && scrollDirRef.current === "up") {
                // without direction tracking, we don't properly remove
              }
            }
          });
          return next;
        });
      },
      {
        root: container,
        threshold: 0.4,
      },
    );

    container.querySelectorAll("[data-section-id]").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      observerRef.current?.disconnect();
    };
  }, [containerRef, enabled, handleScroll]);

  return activeIds;
}

function TableOfContents({ activeIds }: { activeIds: Set<string> }) {
  return (
    <div className="flex flex-col items-center gap-2.5 py-2">
      {SECTIONS.map((section, i) => {
        const isActive = activeIds.has(section.id);
        const sectionIndex = SECTIONS.findIndex((s) => activeIds.has(s.id));
        const lastActiveIndex = [...SECTIONS].reverse().findIndex((s) => activeIds.has(s.id));
        const lastActive = lastActiveIndex >= 0 ? SECTIONS.length - 1 - lastActiveIndex : -1;
        const isPast = sectionIndex >= 0 && i < sectionIndex;
        const isBetween = sectionIndex >= 0 && i >= sectionIndex && i <= lastActive;

        return (
          <div key={section.id} className="relative flex items-center justify-center">
            <motion.div
              className="rounded-full"
              animate={{
                width: isActive ? 8 : isBetween ? 6 : isPast ? 5 : 4,
                height: isActive ? 8 : isBetween ? 6 : isPast ? 5 : 4,
                backgroundColor: isActive
                  ? "var(--text-primary)"
                  : isBetween
                    ? "var(--text-tertiary)"
                    : isPast
                      ? "var(--text-quaternary)"
                      : "var(--border-primary)",
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                mass: 0.5,
              }}
            />
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className="absolute left-1/2 top-1/2 rounded-full bg-primary"
                  style={{
                    border: "1px solid var(--text-quaternary)",
                  }}
                  initial={{ width: 4, height: 4, x: "-50%", y: "-50%", opacity: 0 }}
                  animate={{ width: 16, height: 16, x: "-50%", y: "-50%", opacity: 0.15 }}
                  exit={{ width: 4, height: 4, x: "-50%", y: "-50%", opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </AnimatePresence>
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
      className="flex flex-col justify-center px-6 py-16"
      style={{ minHeight: "45%" }}
    >
      <p className="type-small text-quaternary mb-2 tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </p>
      <p className="type-body text-secondary leading-relaxed max-w-[280px]">
        {SECTION_CONTENT[id]}
      </p>
    </div>
  );
}

export function ScrollDirectionDemo() {
  const [trackDirection, setTrackDirection] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIds = useScrollDirection(containerRef, trackDirection);

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
              backgroundColor: trackDirection ? "var(--text-primary)" : "var(--bg-tertiary)",
              borderColor: trackDirection ? "var(--text-primary)" : "var(--border-secondary)",
            }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            className="absolute top-[3px] rounded-full bg-primary shadow-sm"
            style={{ width: 12, height: 12 }}
            animate={{
              left: trackDirection ? 17 : 3,
              backgroundColor: trackDirection ? "var(--text-inverted)" : "var(--text-quaternary)",
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
          className="h-[320px] overflow-y-auto rounded-lg border border-primary scrollbar-thin scrollbar-thumb-quaternary scrollbar-track-transparent"
        >
          <div className="divide-y divide-primary">
            {SECTIONS.map((section, i) => (
              <SectionBlock key={section.id} id={section.id} index={i} />
            ))}
          </div>
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <TableOfContents activeIds={activeIds} />
        </div>
      </div>

      <p className="type-small text-quaternary text-center max-w-[300px] leading-relaxed">
        {trackDirection
          ? "Sections accurately highlight and unhighlight as they enter and leave the viewport."
          : "Try scrolling down then back up. Without direction tracking, sections stay highlighted."}
      </p>
    </div>
  );
}
