import { cn } from "@/lib/utils";
import { useRive } from "@rive-app/react-canvas";
import { useEffect, useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Link } from "./link";

type Tab = {
  name: string;
  href: string;
};

const tabs = [
  {
    name: "Work",
    href: "/",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Timeline",
    href: "/timeline",
  },
] as Tab[];

export default function Navigation() {
  const pageContext = usePageContext();
  const [scrolled, setScrolled] = useState(false);
  const { urlPathname } = pageContext;
  const activeLink = tabs.find((tab) => tab.href === urlPathname);
  const selectorRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const { rive, RiveComponent } = useRive({
    src: "/animations/florian.riv",
    autoplay: true,
    animations: ["idle"],
  });

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 768) return;

      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <nav className="sticky top-[90vh] md:top-0 z-50 md:w-screen bg-white px-4">
      <div
        className={cn(
          "pointer-events-none hidden md:block absolute left-1/2 w-full transition-all duration-500 ease-in-out h-px -translate-x-1/2 bottom-0 bg-neutral-200",
          scrolled ? "max-w-[100vw]" : "max-w-5xl",
        )}
      />
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between py-2.5 gap-4 relative">
        <div className="w-auto md:w-full max-w-[calc(341px)] items-center justify-between hidden md:flex">
          <div className="flex items-center gap-4">
            <Link
              onMouseEnter={() => {
                rive?.stop("idle");
                rive?.play("happy-in");
              }}
              onMouseLeave={() => {
                rive?.play("idle");
              }}
              href="/"
              className="flex items-center gap-2 rounded-full py-1"
            >
              <RiveComponent className="w-6 h-6" />
              <p className="text-sm font-medium">Florian</p>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-between relative">
          <div
            ref={selectorRef}
            id="selector"
            className={cn(
              "h-7 bg-neutral-100 rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out",
              !activeLink?.href && "invisible opacity-0",
            )}
          />
          <div className="flex items-center justify-center gap-3 relative px-4 flex-1 md:w-full max-w-[calc(341px)]">
            {tabs.map((tab) => (
              <Link
                id={tab.href}
                href={tab.href}
                key={tab.name}
                className={cn(
                  "text-sm rounded-full font-medium relative z-10 px-3 py-1 transition-colors duration-300 ease-in-out",
                  activeLink?.href === tab.href ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-600",
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
              "text-sm hidden md:block font-medium relative z-10 px-3 py-1 transition-colors duration-300 ease-in-out bg-black text-white hover:bg-neutral-800 rounded-full",
              urlPathname === "/contact" && "bg-neutral-900",
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
