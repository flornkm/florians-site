import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { H4 } from "../design-system/heading";
import { Link } from "../ui/link";
import { FlorianKiemLines } from "./florian-kiem-lines";
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

const pagesColumnVariants = cva("flex flex-col items-start gap-2", {
  variants: {
    variant: {
      default: "md:col-start-1",
      indent: "md:col-start-3",
    },
  },
  defaultVariants: { variant: "default" },
});

const MORE_LINKS: Tab[] = [
  { name: "Colophon", href: "/colophon" },
  { name: "Experiments", href: "/experiments" },
];

const LEGAL_LINKS: Tab[] = [
  { name: "Imprint", href: "/imprint" },
  { name: "Privacy Policy", href: "/privacy-policy" },
];

type FooterProps = VariantProps<typeof pagesColumnVariants>;

export default function Footer({ variant = "default" }: FooterProps) {

  return (
    <footer
      className={cn("relative z-10 bg-primary pt-12", variant === "indent" ? "-mt-[156px]" : "mt-24")}
    >
      <div className="mx-auto w-full max-w-[2000px] px-6">
        <div className="grid gap-y-12 md:grid-cols-9">
          <div className={pagesColumnVariants({ variant })}>
            <H4 className="mb-1">Pages</H4>
            {TABS.map((tab) => (
              <Link key={tab.name} href={tab.href} className={footerLinkVariants({ size: "medium" })}>
                {tab.name}
              </Link>
            ))}
          </div>

          {variant === "default" && (
            <div className="flex flex-col items-start gap-2 md:col-start-3 md:col-span-2">
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
          )}

          <div className="flex flex-col items-start gap-2 md:col-start-8 md:col-span-2">
            <H4 className="mb-1">Legal</H4>
            {LEGAL_LINKS.map((tab) => (
              <Link key={tab.name} href={tab.href} className={footerLinkVariants({ size: "medium" })}>
                {tab.name}
              </Link>
            ))}
          </div>
        </div>

        <FlorianKiemLines className="mt-16 mb-8" />
      </div>
    </footer>
  );
}
