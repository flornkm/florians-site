import { Body4 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import Button from "@/components/ui/button";
import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils";
import { IconArrowUpRight } from "central-icons/IconArrowUpRight";
import { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { TimelineItem } from "./types";

export default function Page() {
  const pageContext = usePageContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const items = pageContext.data as TimelineItem[];

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Enable scroll snapping on the html element
    document.documentElement.style.scrollSnapType = "y mandatory";
    document.documentElement.style.scrollBehavior = "smooth";

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

    return () => {
      observer.disconnect();
      // Clean up scroll snap styles
      document.documentElement.style.scrollSnapType = "";
      document.documentElement.style.scrollBehavior = "";
    };
  }, [items.length]);

  const handleOpen = (index: number) => {
    setIsTransitioning(true);

    const item = document.getElementById(`collection-item-${items[index].slug}`);
    const itemDistanceToTopScreen = (item?.getBoundingClientRect().top || 0) - 28;

    if (item) {
      item.style.height = "100vh";
      item.style.width = "100%";
      item.style.top = `${-itemDistanceToTopScreen}px`;
      item.style.zIndex = "999";
      item.style.border = "none";
      item.style.paddingTop = "48px";
      item.style.boxShadow = "none";
      item.style.padding = "48px 0";
    }

    setTimeout(() => {
      navigate(`/collection/${items[index].slug}`);
    }, 500);
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-5xl md:px-0 px-4 mx-auto">
        <div
          className="bg-gradient-to-b from-white via-white dark:from-black dark:via-black to-transparent pt-12 pb-8 -mb-16 z-10 h-72 flex items-center"
          style={{ scrollSnapAlign: "start" }}
        >
          <H1 className="text-center mb-3 w-full">A blog, photos, experiments, and more updates</H1>
        </div>
        <div className="sticky z-10 top-16 md:top-28 flex flex-col items-center gap-4 h-0">
          {items.map((item, index) => {
            const gotShown = index < activeIndex;

            return (
              <div
                style={{
                  zIndex: items.length - Math.abs(activeIndex - index),
                  top: `-${Math.abs(activeIndex - index) * 64}px`,
                  pointerEvents: activeIndex === index ? "auto" : "none",
                  visibility: gotShown ? "hidden" : "visible",
                  transform: `scale(${gotShown ? 1.05 : Math.max(0.2, 1 - Math.abs(activeIndex - index) * 0.1)})`,
                  opacity: activeIndex === index ? 1 : gotShown ? 0 : 1 - index * 0.1,
                }}
                id={`collection-item-${item.slug}`}
                key={item.slug}
                className="w-full absolute mt-8 transition-all duration-300 h-[calc(100vh-14rem)] bg-white dark:bg-neutral-950 dark:border-neutral-800 shadow-xl shadow-black/[.03] rounded-2xl p-8 border border-neutral-200"
              >
                <Button
                  onClick={() => handleOpen(index)}
                  className={cn(
                    "absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center",
                    isTransitioning && "opacity-0",
                  )}
                  variant="secondary"
                >
                  <IconArrowUpRight className="w-4 h-4 shrink-0" />
                </Button>
                <Body4 className="capitalize text-black dark:text-white mb-4 font-mono">{item.type}</Body4>
                <div className="w-full h-full flex items-start justify-center">
                  <article
                    className={`${proseVariants.default} max-w-lg w-full`}
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
          <div
            key={index}
            data-scroll-section
            data-index={index}
            className="h-[calc(100vh)] w-full"
            style={{ scrollSnapAlign: "start" }}
          />
        ))}
      </div>
    </div>
  );
}
