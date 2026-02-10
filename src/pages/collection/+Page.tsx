import { Body4 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import { mdxComponents } from "@/components/shared/mdx-content";
import Button from "@/components/ui/button";
import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils";
import { MDXProvider } from "@mdx-js/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { IconExpand45 } from "central-icons/IconExpand45";
import { ComponentType, useEffect, useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { CollectionItem } from "./types";

const mdxModules = import.meta.glob("/content/collection/*.mdx", { eager: true }) as Record<
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

  const items = pageContext.data as CollectionItem[];
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

    const item = document.getElementById(`collection-item-${items[index].slug}`);
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
      navigate(`/collection/${items[index].slug}`);
    }, 500);
  };

  const getMDXContent = (slug: string) => {
    const modulePath = `/content/collection/${slug}.mdx`;
    return mdxModules[modulePath]?.default;
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-5xl md:px-0 px-4 mx-auto">
        <div
          className="relative bg-linear-to-b from-primary via-primary to-transparent pt-12 pb-8 -mb-16 z-50 lg:h-72 h-48 flex md:items-center items-start"
          style={{ scrollSnapAlign: "start" }}
        >
          <H1 className="text-center mb-3 w-full">Updates & archive</H1>
        </div>
        <div className="sticky z-10 top-16 md:top-28 flex flex-col items-center gap-4 h-0">
          {items.map((item, index) => {
            const gotShown = index < activeIndex;
            const MDXContent = getMDXContent(item.slug);

            return (
              <div
                style={{
                  zIndex: items.length - Math.abs(activeIndex - index),
                  top: `-${Math.abs(activeIndex - index) * (isMobile ? 5 : 6)}vh`,
                  pointerEvents: activeIndex === index ? "auto" : "none",
                  visibility: gotShown ? "hidden" : "visible",
                  transform: `scale(${gotShown ? 1.05 : Math.max(0.2, 1 - Math.abs(activeIndex - index) * 0.1)})`,
                  opacity: gotShown ? 0 : 1,
                }}
                id={`collection-item-${item.slug}`}
                key={item.slug}
                className={cn(
                  "w-full absolute mt-8 transition-all duration-300 h-[calc(100vh-14rem)] bg-primary shadow-xl dark:shadow-none shadow-emphasis rounded-2xl p-8 border border-primary",
                  isTransitioning ? "mt-10 md:mt-8" : "dark:bg-secondary",
                )}
              >
                <Button
                  onClick={() => handleOpen(index)}
                  className={cn(
                    "absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    isTransitioning && "top-12 right-2 md:right-6",
                  )}
                  variant="secondary"
                >
                  <IconExpand45
                    className={cn(
                      "w-4 h-4 shrink-0 transition-all duration-500",
                      isTransitioning && "opacity-0 blur-[1px]",
                    )}
                  />
                </Button>
                <Body4 className="capitalize text-primary mb-10 md:mb-4 font-mono">{item.type}</Body4>
                <div className="w-full h-full flex items-start justify-center">
                  <div className="w-full h-full max-w-lg -mt-7 mask-b-from-70%">
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
