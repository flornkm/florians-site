import { cn } from "@/lib/utils";
import { useLocation } from "@tanstack/react-router";
import { animate, useMotionValue } from "motion/react";
import ContactDialog from "./contact-dialog";
import { Logo } from "./logo";
import { Link } from "../ui/link";

const logoTransition = { type: "spring", duration: 0.3, bounce: 0 } as const;
// Width of the expanded "FLORIAN KIEM" so the hover zone covers the whole word, not just the tiny collapsed logo.
const LOGO_HOVER_WIDTH = 108;

export type Tab = {
  name: string;
  href: string;
};

export const TABS = [
  { name: "Work", href: "/" },
  { name: "About", href: "/about" },
  { name: "Writing", href: "/writing" },
] as Tab[];

export default function Navigation() {
  const { pathname } = useLocation();

  // Lives here so the whole Home link (spanning the overflow area) opens the logo and keeps it open without flicker.
  const logoProgress = useMotionValue(0);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || pathname.startsWith("/work")
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="relative z-50 bg-primary">
      <div className="mx-auto grid w-full max-w-[2000px] grid-cols-9 items-center gap-x-6 px-6 pt-6 pb-4">
        {/* w-fit keeps the link hugging the logo so its footprint isn't the whole 2-column track. */}
        <Link href="/" className="flex w-fit items-center col-span-2 justify-self-start" aria-label="Home">
          <span
            className="relative flex shrink-0 items-center"
            style={{ width: LOGO_HOVER_WIDTH }}
            onMouseEnter={() => animate(logoProgress, 1, logoTransition)}
            onMouseLeave={() => animate(logoProgress, 0, logoTransition)}
          >
            <Logo className="h-3 w-auto text-primary" progress={logoProgress} />
          </span>
        </Link>
        <div className="flex items-center gap-4 col-span-5 md:gap-6">
          {TABS.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive(tab.href) ? "text-primary" : "text-tertiary hover:text-secondary",
              )}
            >
              {tab.name}
            </Link>
          ))}
        </div>
        {/* Fixed on desktop, anchored to the content's right edge (not the viewport) so it stays aligned past the 2000px max-width. */}
        <div className="flex justify-end col-span-2 md:fixed md:top-6 md:z-50 md:right-[max(1.5rem,calc((100vw-2000px)/2+1.5rem))]">
          <ContactDialog />
        </div>
      </div>
    </nav>
  );
}
