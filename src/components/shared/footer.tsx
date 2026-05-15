import { IconEmail2 } from "central-icons/IconEmail2";
import { IconGithub } from "central-icons/IconGithub";
import { IconInstagram } from "central-icons/IconInstagram";
import { IconLinkedin } from "central-icons/IconLinkedin";
import { IconPhone } from "central-icons/IconPhone";
import { IconX } from "central-icons/IconX";

import { CONTACTS } from "@/const/contacts";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import type { ComponentType } from "react";
import { Body4 } from "../design-system/body";
import { H4 } from "../design-system/heading";
import { Link } from "../ui/link";
import { TooltipGroup, TooltipTrigger } from "../ui/tooltip";
import { Tab, TABS } from "./navigation";

const footerLinkVariants = cva(
  "font-medium flex items-center gap-2 text-tertiary hover:text-secondary transition-all",
  {
    variants: {
      size: {
        small: "text-xs",
        medium: "text-sm",
      },
    },
    defaultVariants: { size: "medium" },
  },
);

const MORE_LINKS: Tab[] = [
  { name: "Colophon", href: "/colophon" },
  { name: "Experiments", href: "/experiments" },
];

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  "X (Twitter)": IconX,
  GitHub: IconGithub,
  LinkedIn: IconLinkedin,
  Instagram: IconInstagram,
  Email: IconEmail2,
  iMessage: IconPhone,
};

const SOCIAL_LINKS = CONTACTS.map((c) => ({
  name: c.name,
  href: c.href,
  icon: ICON_MAP[c.name],
})).filter((l) => l.icon);

const LEGAL_LINKS: Tab[] = [
  { name: "Imprint", href: "/imprint" },
  { name: "Privacy Policy", href: "/privacy-policy" },
];

export default function Footer() {
  return (
    <footer className="md:pb-8 pb-24 px-4 mt-24 relative z-10 pt-12 mask-t-from-90% mask-t-to-100% bg-primary">
      <div className="container mx-auto max-w-5xl space-y-12">
        <div className="w-full grid grid-cols-4 mx-auto">
          <div className="flex flex-col items-start gap-2">
            <H4 className="mb-1">Pages</H4>
            {TABS.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={footerLinkVariants({ size: "medium" })}
              >
                {tab.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-start gap-2">
            <H4 className="mb-1">More</H4>
            {MORE_LINKS.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={footerLinkVariants({ size: "medium" })}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="w-full flex items-end justify-between flex-wrap gap-4">
          <div>
            <TooltipGroup>
              <div className="flex items-center mb-4">
                {SOCIAL_LINKS.map((tab) => (
                  <TooltipTrigger key={tab.name} content={tab.name}>
                    <Link
                      href={tab.href}
                      target="_blank"
                      className={cn(footerLinkVariants({ size: "medium" }), "px-1")}
                    >
                      <tab.icon className="w-4.5 h-4.5" />
                    </Link>
                  </TooltipTrigger>
                ))}
              </div>
            </TooltipGroup>
            <Body4 className="leading-relaxed text-xs text-tertiary">
              Thanks for taking the time to visit my area in the internet.
            </Body4>
          </div>
          <div className="flex items-center gap-4 justify-end">
            {LEGAL_LINKS.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={footerLinkVariants({ size: "small" })}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
