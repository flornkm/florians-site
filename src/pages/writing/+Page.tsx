import { H1 } from "@/components/design-system/heading";
import { mdxComponents } from "@/components/shared/mdx-content";
import Button from "@/components/ui/button";
import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils";
import { MDXProvider } from "@mdx-js/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { ComponentType, useEffect, useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { WritingItem } from "./types";

const mdxModules = import.meta.glob("/content/writing/*.mdx", { eager: true }) as Record<
  string,
  { default: ComponentType }
>;

export default function Page() {
  const { width } = useWindowSize();
  const pageContext = usePageContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sectionsRef = useRef<HTMLElement[] | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const baseTopRef = useRef<number>(0);

  const items = pageContext.data as WritingItem[];
  const isMobile = width! < 768;

  useEffect(() => {
    if (typeof window === "undefined") return;

    document.documentElement.style.scrollSnapType = "y mandatory";
    document.documentElement.style.scrollBehavior = "smooth";

    sectionsRef.current = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-section]"));

    const computeBaseTop = () => {
      const first = sectionsRef.current?.[0] || null;
      baseTopRef.current = first ? first.getBoundingClientRect().top + window.scrollY : 0;
    };

    const updateActiveIndex = () => {
      rafIdRef.current = null;
      const sections = sectionsRef.current || [];
      if (!sections.length) return;
      const base = baseTopRef.current || 0;
      const raw = (window.scrollY - base) / window.innerHeight;
      const idx = Math.round(raw);
      const clamped = Math.max(0, Math.min(sections.length - 1, idx));
      setActiveIndex((prev) => (prev === clamped ? prev : clamped));
    };

    const onScroll = () => {
      if (rafIdRef.current != null) return;
      rafIdRef.current = window.requestAnimationFrame(updateActiveIndex);
    };
    const onResize = () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      computeBaseTop();
      rafIdRef.current = window.requestAnimationFrame(updateActiveIndex);
    };

    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      sectionsRef.current = null;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      document.documentElement.style.scrollSnapType = "";
      document.documentElement.style.scrollBehavior = "";
    };
  }, [items.length]);

  const handleOpen = (index: number) => {
    setIsTransitioning(true);

    const item = document.getElementById(`writing-item-${items[index].slug}`);
    const boundingRectTop = item?.getBoundingClientRect().top || 0;
    const itemDistanceToTopScreen = isMobile ? boundingRectTop + 30 : boundingRectTop - 28;

    if (item) {
      item.style.height = "100vh";
      item.style.width = "100%";
      item.style.top = `${-itemDistanceToTopScreen}px`;
      item.style.zIndex = "999";
      item.style.border = "none";
      item.style.paddingTop = isMobile ? "0" : "48px";
      item.style.boxShadow = "none";
      item.style.padding = "48px 0";
    }

    setTimeout(() => {
      navigate(`/writing/${items[index].slug}`);
    }, 500);
  };

  const getMDXContent = (slug: string) => {
    const modulePath = `/content/writing/${slug}.mdx`;
    return mdxModules[modulePath]?.default;
  };

  return (
    <div className="w-full pb-96">
      <div className="w-full max-w-5xl md:px-0 px-4 mx-auto">
        <div
          className={cn(
            "relative transition-all ease-out bg-linear-to-b from-primary via-primary to-transparent -mt-24 pt-24 z-50 flex md:items-center items-start",
            isTransitioning && "-ml-2 opacity-0 blur-[2px]",
          )}
          style={{ scrollSnapAlign: "start" }}
        >
          <H1 className="w-full">Writing</H1>
        </div>
        <div
          className={cn(
            "sticky md:mt-24 top-16 md:top-28 flex flex-col items-center gap-4 h-0",
            isTransitioning ? "z-[51]" : "z-10",
          )}
        >
          {items.map((item, index) => {
            const gotShown = index < activeIndex;
            const MDXContent = getMDXContent(item.slug);

            return (
              <div
                style={{
                  zIndex: items.length - Math.abs(activeIndex - index),
                  top: `-${Math.abs(activeIndex - index) * 0}px`,
                  pointerEvents: activeIndex === index ? "auto" : "none",
                  visibility: gotShown ? "hidden" : "visible",
                  transform: `scale(${gotShown ? 1.05 : Math.max(0.2, 1 - Math.abs(activeIndex - index) * 0.1)})`,
                  opacity: gotShown ? 0 : 1,
                  filter: gotShown ? "blur(2px)" : "none",
                }}
                id={`writing-item-${item.slug}`}
                key={item.slug}
                className={cn(
                  "w-full absolute mt-8 transition-all duration-300 h-[450px] bg-primary",
                  isTransitioning ? "mt-19 md:mt-16.5" : "dark:bg-secondary",
                )}
              >
                <div className="w-full h-full flex flex-col items-center">
                  <div className="w-full flex-1 max-w-lg -mt-7 mask-b-from-70% overflow-hidden">
                    {MDXContent ? (
                      <article className={proseVariants({ variant: "default" })}>
                        <MDXProvider components={mdxComponents}>
                          <MDXContent />
                        </MDXProvider>
                      </article>
                    ) : (
                      <div>Content not found</div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleOpen(index)}
                    className={cn("transition-opacity duration-300", isTransitioning && "opacity-0")}
                    variant="secondary"
                    size="sm"
                  >
                    Read more
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        {items.map((item, index) => (
          <div
            key={item.slug}
            id={`section-${item.slug}`}
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
