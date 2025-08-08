import { cn } from "@/lib/utils";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useEffect, useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Body1 } from "../design-system/body";
import { buttonVariants } from "../ui/button";
import { Link } from "../ui/link";

export type Tab = {
  name: string;
  href: string;
};

export const TABS = [
  {
    name: "Work",
    href: "/",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Collection",
    href: "/collection",
  },
] as Tab[];

export default function Navigation() {
  const pageContext = usePageContext();
  const [scrolled, setScrolled] = useState(false);
  const { urlPathname } = pageContext;
  const activeLink = TABS.find((tab) => tab.href === urlPathname);
  const selectorRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const { rive, RiveComponent } = useRive({
    src: "/animations/florian.riv",
    autoplay: true,
    artboard: "face",
    stateMachines: "State Machine 1",
  });

  const selectInput = useStateMachineInput(rive, "State Machine 1", "select");

  // handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 768) return;

      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // adjust selector when clicking a link
  useEffect(() => {
    if (!activeLink) return;

    const activeLinkElement = tabsRef.current.get(activeLink.href);
    const selector = selectorRef.current;

    if (activeLinkElement && selector) {
      const { width, left } = activeLinkElement.getBoundingClientRect();
      const parentLeft = activeLinkElement.parentElement?.getBoundingClientRect().left || 0;

      selector.style.width = `${width}px`;
      selector.style.left = `${left - parentLeft}px`;
    }
  }, [urlPathname, activeLink]);

  // adjust selector when resizing window
  useEffect(() => {
    if (!activeLink) return;

    const handleResize = () => {
      const activeLinkElement = tabsRef.current.get(activeLink.href);
      const selector = selectorRef.current;

      if (activeLinkElement && selector) {
        const { width, left } = activeLinkElement.getBoundingClientRect();
        const parentLeft = activeLinkElement.parentElement?.getBoundingClientRect().left || 0;

        selector.style.width = `${width}px`;
        selector.style.left = `${left - parentLeft}px`;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeLink]);

  return (
    <nav className="sticky top-[calc(100dvh-4rem)] -mb-12 md:mb-0 md:top-0 z-50 px-1 xs:px-3 md:w-screen md:shadow-none bg-white dark:bg-black md:px-4 border md:border-none border-neutral-100 shadow-xl shadow-black/5 md:max-w-none mx-auto dark:md:border-none dark:border dark:border-neutral-900 w-fit max-w-[calc(100%-2rem)] md:rounded-none rounded-full">
      <div
        className={cn(
          "pointer-events-none hidden md:block absolute left-1/2 w-full transition-all duration-500 ease-in-out h-px -translate-x-1/2 bottom-0 bg-neutral-100 dark:bg-neutral-900",
          scrolled ? "max-w-[100vw]" : "max-w-5xl",
        )}
      />
      <div className="mx-auto flex md:w-full max-w-5xl items-center justify-between md:py-2.5 py-1 gap-2 md:gap-4 relative">
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
              className="flex items-center gap-1 text-ms rounded-full py-1 touch-manipulation"
            >
              <RiveComponent className="w-5.5 dark:invert aspect-square" />
              <Body1 className="font-medium text-black dark:text-white min-[500px]:block hidden">Florian</Body1>
            </Link>
          </div>
        </div>
        <div className="md:flex-1 flex items-center justify-between relative">
          <div
            ref={selectorRef}
            id="selector"
            className={cn(
              "md:h-7 h-8 bg-neutral-100 right-0 dark:bg-neutral-900 rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out",
              !activeLink?.href && "invisible opacity-0",
            )}
          />
          <div className="flex min-[350px]:mr-2 md:mr-auto items-center justify-center gap-3 relative md:px-4 md:flex-1 md:w-full md:max-w-[calc(341px)]">
            {TABS.map((tab) => (
              <Link
                id={tab.href}
                href={tab.href}
                key={tab.name}
                className={cn(
                  "text-ms rounded-full font-medium relative z-10 px-3 py-1 md:py-0.5 transition-colors duration-300 ease-in-out",
                  activeLink?.href === tab.href
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-500",
                )}
                ref={(el) => {
                  if (el) tabsRef.current.set(tab.href, el);
                }}
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
              buttonVariants({ variant: "primary" }),
              "text-ms text-white hidden max-md:mr-px min-[350px]:block font-medium relative z-10 px-2.5 py-1 md:py-0.5 transition-colors duration-300 ease-in-out w-auto rounded-full",
              urlPathname === "/contact" && "bg-neutral-900 dark:bg-white",
            )}
            ref={(el) => {
              if (el) tabsRef.current.set("/contact", el);
            }}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
