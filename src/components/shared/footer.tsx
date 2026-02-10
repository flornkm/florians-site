import { IconEmail2 } from "central-icons/IconEmail2";
import { IconGithub } from "central-icons/IconGithub";
import { IconInstagram } from "central-icons/IconInstagram";
import { IconLinkedin } from "central-icons/IconLinkedin";
import { IconPhone } from "central-icons/IconPhone";
import { IconX } from "central-icons/IconX";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Body4 } from "../design-system/body";
import { H4 } from "../design-system/heading";
import { Link } from "../ui/link";
import Tooltip from "../ui/tooltip";
import { Tab, TABS } from "./navigation";

interface SocialLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

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
  { name: "Contact", href: "/contact" },
];

const SOCIAL_LINKS: SocialLink[] = [
  { name: "X (Twitter)", href: "https://twitter.com/flornkm", icon: IconX },

  { name: "GitHub", href: "https://github.com/flornkm", icon: IconGithub },
  { name: "LinkedIn", href: "https://linkedin.com/in/flornkm", icon: IconLinkedin },
  { name: "Instagram", href: "https://instagram.com/flornkm", icon: IconInstagram },
  { name: "Email", href: "mailto:hello@floriankiem.com", icon: IconEmail2 },
  { name: "iMessage", href: "imessage://hello@floriankiem.com", icon: IconPhone },
];

const LEGAL_LINKS: Tab[] = [
  { name: "Imprint", href: "/imprint" },
  { name: "Privacy Policy", href: "/privacy-policy" },
];

export default function Footer() {
  return (
    <footer
      className="md:pb-8 pb-24 px-4 mt-24 relative z-10 pt-12 mask-t-from-90% mask-t-to-100% bg-primary"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="container mx-auto max-w-5xl space-y-12">
        <div className="w-full grid grid-cols-4 mx-auto">
          <div className="flex flex-col items-start gap-2">
            <H4 className="mb-1">Pages</H4>
            {TABS.map((tab) => (
              <Link key={tab.name} href={tab.href} className={footerLinkVariants({ size: "medium" })}>
                {tab.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-start gap-2">
            <H4 className="mb-1">More</H4>
            {MORE_LINKS.map((tab) => (
              <Link key={tab.name} href={tab.href} className={footerLinkVariants({ size: "medium" })}>
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="w-full flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center mb-4">
              {SOCIAL_LINKS.map((tab) => (
                <Tooltip key={tab.name} content={tab.name}>
                  <Link href={tab.href} target="_blank" className={cn(footerLinkVariants({ size: "medium" }), "px-1")}>
                    <tab.icon className="w-4.5 h-4.5" />
                  </Link>
                </Tooltip>
              ))}
            </div>
            <Body4 className="leading-relaxed">Thanks for taking the time to visit my area in the internet.</Body4>
          </div>
          <div className="flex items-center gap-4 justify-end">
            {LEGAL_LINKS.map((tab) => (
              <Link key={tab.name} href={tab.href} className={footerLinkVariants({ size: "small" })}>
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
