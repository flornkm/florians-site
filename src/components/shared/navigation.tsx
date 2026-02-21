import { cn } from "@/lib/utils";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Body1 } from "../design-system/body";
import { buttonVariants } from "../ui/button";
import { Link } from "../ui/link";

export type Tab = {
  name: string;
  href: string;
};

export const TABS = [
  { name: "Work", href: "/" },
  { name: "About", href: "/about" },
  { name: "Writing", href: "/writing" },
] as Tab[];

type TabDimensions = { left: number; width: number };

export default function Navigation() {
  const pageContext = usePageContext();
  const [scrolled, setScrolled] = useState(false);
  const { urlPathname } = pageContext;
  const activeIndex = TABS.findIndex((tab) => tab.href === urlPathname);

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [tabDimensions, setTabDimensions] = useState<TabDimensions[]>([]);
  const [isReady, setIsReady] = useState(false);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const lastHoveredIndexRef = useRef<number>(0);

  const { rive, RiveComponent } = useRive({
    src: "/animations/florian.riv",
    autoplay: true,
    artboard: "face",
    stateMachines: "State Machine 1",
  });

  const selectInput = useStateMachineInput(rive, "State Machine 1", "select");

  const measureTabs = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const dimensions: TabDimensions[] = [];

    tabRefs.current.forEach((tab) => {
      if (tab) {
        const tabRect = tab.getBoundingClientRect();
        dimensions.push({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        });
      }
    });

    if (dimensions.length === TABS.length) {
      setTabDimensions(dimensions);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    measureTabs();

    if (document.fonts?.ready) {
      document.fonts.ready.then(measureTabs);
    }

    window.addEventListener("resize", measureTabs);
    return () => window.removeEventListener("resize", measureTabs);
  }, [measureTabs]);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 768) return;
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasActiveTab = activeIndex !== -1;
  const isHovering = hoveredIndex !== null;

  useEffect(() => {
    if (hoveredIndex !== null) {
      lastHoveredIndexRef.current = hoveredIndex;
    }
  }, [hoveredIndex]);

  useEffect(() => {
    if (!hasActiveTab && isHovering && !hasAnimatedIn) {
      requestAnimationFrame(() => {
        setHasAnimatedIn(true);
      });
    } else if (!hasActiveTab && !isHovering) {
      setHasAnimatedIn(false);
    }
  }, [hasActiveTab, isHovering, hasAnimatedIn]);

  const displayIndex = isHovering ? hoveredIndex : hasActiveTab ? activeIndex : lastHoveredIndexRef.current;

  const selectorDimensions = tabDimensions[displayIndex];
  const showSelector = isReady && selectorDimensions;
  const shouldAnimatePosition = hasActiveTab || hasAnimatedIn;
  const isVisible = hasActiveTab || isHovering;

  return (
    <nav className="sticky top-[calc(100dvh-4rem)] -mb-12 md:mb-0 md:top-0 z-[99] px-2 xs:px-3 md:w-screen bg-primary md:px-4 border md:border-none border-tertiary md:max-w-none mx-auto w-fit max-w-[calc(100%-2rem)] md:rounded-none rounded-full">
      <div
        className={cn(
          "pointer-events-none hidden md:block absolute left-1/2 w-full transition-all duration-300 ease-out h-px -translate-x-1/2 bottom-0 bg-(--border-primary)",
          scrolled ? "max-w-[100vw]" : "max-w-5xl opacity-0",
        )}
      />
      <div className="mx-auto flex md:w-full max-w-5xl items-center justify-between md:py-2.5 py-2 gap-2 md:gap-4 relative">
        <div className="w-auto md:w-full max-w-[calc(341px)] items-center justify-between hidden min-[450px]:mr-2 min-[450px]:flex">
          <div className="flex items-center gap-4">
            <Link
              onMouseEnter={() => {
                if (selectInput) selectInput.value = true;
              }}
              onMouseLeave={() => {
                if (selectInput) selectInput.value = false;
              }}
              onTouchStart={() => {
                if (selectInput) selectInput.value = true;
              }}
              onTouchEnd={() => {
                if (selectInput) selectInput.value = false;
              }}
              href="/"
              className="flex items-center gap-1 text-sm rounded-full py-1 touch-manipulation"
            >
              <RiveComponent className="w-5.5 dark:invert aspect-square" />
              <Body1 className="font-medium text-primary min-[500px]:block hidden">Florian</Body1>
            </Link>
          </div>
        </div>
        <div className="md:flex-1 flex items-center justify-between relative">
          <div
            ref={containerRef}
            className="flex min-[350px]:mr-2 md:mr-auto items-center justify-center gap-3 relative md:px-4 md:flex-1 md:w-full md:max-w-[calc(341px)]"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {showSelector && (
              <motion.div
                className="absolute md:h-7 h-8 bg-surface-tertiary rounded-full top-1/2 -translate-y-1/2"
                initial={false}
                animate={{
                  left: selectorDimensions.left,
                  width: selectorDimensions.width,
                  opacity: isVisible ? 1 : 0,
                }}
                transition={{
                  left: shouldAnimatePosition ? { type: "spring", stiffness: 400, damping: 30 } : { duration: 0 },
                  width: shouldAnimatePosition ? { type: "spring", stiffness: 400, damping: 30 } : { duration: 0 },
                  opacity: { duration: 0.2, ease: "easeOut" },
                }}
              />
            )}
            {TABS.map((tab, index) => (
              <Link
                id={tab.href}
                href={tab.href}
                key={tab.name}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                className={cn(
                  "text-sm rounded-full font-medium relative z-10 px-3 py-1 md:py-0.5 transition-colors duration-300 ease-in-out",
                  activeIndex === index ? "text-primary" : "text-tertiary",
                )}
              >
                {tab.name}
              </Link>
            ))}
          </div>
          <Link
            id="contact"
            href="/contact"
            key="contact"
            className={cn(
              buttonVariants({ variant: "primary", size: "xs" }),
              "text-sm text-accent-foreground hidden max-md:mr-px min-[350px]:block font-medium relative z-10 px-2.5 py-1 md:py-0.5 transition-colors duration-300 ease-in-out w-auto rounded-full",
              urlPathname === "/contact" && "bg-accent-primary",
            )}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
