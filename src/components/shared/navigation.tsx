import { cn } from "@/lib/utils";
import { useLocation } from "@tanstack/react-router";
import { animate, motion, useMotionValue } from "motion/react";
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
        <Link
          href="/"
          className="flex w-fit items-center col-span-2 justify-self-start"
          aria-label="Home"
        >
          <span
            className="relative flex shrink-0 items-center"
            style={{ width: LOGO_HOVER_WIDTH }}
            onMouseEnter={() => animate(logoProgress, 1, logoTransition)}
            onMouseLeave={() => animate(logoProgress, 0, logoTransition)}
          >
            <Logo className="h-3 w-auto text-primary" progress={logoProgress} />
          </span>
        </Link>
        <div className="hidden items-center gap-4 col-span-5 md:flex md:gap-6">
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
        {/* Desktop only: fixed and anchored to the content's right edge (not the viewport) so it stays aligned past the 2000px max-width. On mobile the Contact button lives in the bottom bar instead. */}
        <div className="hidden justify-end col-span-2 md:flex md:fixed md:top-6 md:z-50 md:right-[max(1.5rem,calc((100vw-2000px)/2+1.5rem))]">
          <ContactDialog />
        </div>
      </div>

      {/* Mobile-only floating bar; on desktop the tabs and Contact live in the top nav above. */}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center md:hidden">
        <div className="flex items-center gap-1 rounded-[14px] border border-primary bg-primary p-1.5 shadow-lg">
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "relative px-4 py-1.5 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-tertiary hover:text-secondary",
                )}
              >
                {/* Shared-layout pill: Framer slides this single element between tabs when the active route changes. */}
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.8 }}
                    className="absolute inset-0 rounded-lg bg-surface-tertiary"
                  />
                )}
                <span className="relative">{tab.name}</span>
              </Link>
            );
          })}
          <ContactDialog roundedRightWhenClosed />
        </div>
      </div>
    </nav>
  );
}
