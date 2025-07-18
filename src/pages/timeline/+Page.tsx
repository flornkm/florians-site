import ArrowTopRight from "@/components/icons/arrow-top-right";
import Button from "@/components/shared/button";
import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { TimelineItem } from "./types";

export default function Page() {
  const pageContext = usePageContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const items = pageContext.data as TimelineItem[];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setActiveIndex(index);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-10% 0px -10% 0px",
      },
    );

    const sections = document.querySelectorAll("[data-scroll-section]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [items.length]);

  const handleOpen = (index: number) => {
    setIsTransitioning(true);

    const body = document.body;
    body.style.overflow = "hidden";

    const item = document.getElementById(`timeline-item-${items[index].slug}`);
    const itemDistanceToTopScreen = (item?.getBoundingClientRect().top || 0) - 28;

    if (item) {
      item.style.height = "100vh";
      item.style.width = "100vw";
      item.style.top = `${-itemDistanceToTopScreen}px`;
      item.style.zIndex = "999";
      item.style.backgroundColor = "white";
      item.style.border = "none";
      item.style.paddingTop = "48px";
    }

    // setTimeout(() => {
    //   navigate(`/timeline/${items[index].slug}`);
    // }, 500);
  };

  return (
    <div className="w-full px-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-gradient-to-b from-white via-white to-transparent pt-12 pb-8 -mt-8 z-10">
          <h1 className="text-lg font-semibold text-center">A blog, photos, experiments, and more updates</h1>
        </div>
        <div className="sticky z-10 top-40 flex flex-col items-center gap-4 h-0">
          {items.map((item, index) => {
            const gotShown = index < activeIndex;

            return (
              <div
                style={{
                  zIndex: items.length - Math.abs(activeIndex - index),
                  top: `-${Math.abs(activeIndex - index) * 72}px`,
                  pointerEvents: activeIndex === index ? "auto" : "none",
                  visibility: gotShown ? "hidden" : "visible",
                  transform: `scale(${gotShown ? 1.05 : Math.max(0.2, 1 - Math.abs(activeIndex - index) * 0.1)})`,
                  opacity: activeIndex === index ? 1 : gotShown ? 0 : 1 - index * 0.1,
                }}
                id={`timeline-item-${item.slug}`}
                key={item.slug}
                className="w-full absolute mt-8 transition-all duration-300 h-[calc(100vh-16rem)] bg-white shadow-xl shadow-black/[.03] rounded-2xl p-8 border border-neutral-200"
              >
                <Button
                  onClick={() => handleOpen(index)}
                  className={cn(
                    "absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center",
                    isTransitioning && "opacity-0",
                  )}
                  variant="secondary"
                >
                  <ArrowTopRight className="w-4 h-4 shrink-0" />
                </Button>
                <h2 className="text-sm font-semibold capitalize mb-4 font-mono">{item.type}</h2>
                <div className="w-full h-full overflow-hidden flex items-start justify-center">
                  <div
                    className={`${proseVariants.default} max-w-lg`}
                    dangerouslySetInnerHTML={{ __html: item.content || "" }}
                    style={{
                      maskImage: "linear-gradient(to bottom, black 90%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(to bottom, black 90%, transparent 100%)",
                      height: "100%",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {Array.from({ length: items.length }).map((_, index) => (
          <div key={index} data-scroll-section data-index={index} className="h-[calc(100vh)] w-full">
            <div className="text-white text-2xl">Item {index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
