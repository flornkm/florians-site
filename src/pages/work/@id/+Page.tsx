import { Body2 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import { useMdxContent } from "@/components/shared/mdx-content";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { TooltipGroup, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils.js";
import { IconArrowUpRight } from "central-icons/IconArrowUpRight";
import { IconChevronLeft } from "central-icons/IconChevronLeft";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState, useSyncExternalStore } from "react";
import { useData } from "vike-react/useData";
import type { Data } from "./+data.js";

const INFO_WIDTH = 440;
const SCROLL_THRESHOLD = 80;
const spring = { type: "spring" as const, stiffness: 180, damping: 24, mass: 1 };

export default function Page() {
  const project = useData<Data>();

  const isDesktop = useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia("(min-width: 768px)");
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );

  const { scrollY } = useScroll();
  const [collapsed, setCollapsed] = useState(() => scrollY.get() > SCROLL_THRESHOLD);
  useMotionValueEvent(scrollY, "change", (y) => setCollapsed(y > SCROLL_THRESHOLD));

  const content = useMdxContent("work", project.slug);

  if (!content) {
    return <div>Content not found</div>;
  }

  const infoPanel = (
    <>
      <Link href="/" className="group/link mb-2 flex w-auto items-start gap-2 text-sm font-medium">
        <IconChevronLeft className="mt-1.5 h-4 w-4" />
        <div className="h-7 flex-1 mt-0.5">
          <div className="pointer-events-none transition-all duration-200 ease-out group-hover/link:-translate-y-[22.5px] group-focus-within/link:-translate-y-[22.5px]">
            <H1 className="transition-all duration-200 ease-out group-hover/link:opacity-0 group-hover/link:blur-[1px] group-focus-within/link:opacity-0 group-focus-within/link:blur-[1px]">
              {project.title} <span className="text-sm text-quaternary">{project.date.split("/")[1]}</span>
            </H1>
            <span
              className={cn(
                "truncate opacity-0 blur-[1px] transition-all duration-200 ease-out focus:hidden",
                "group-hover/link:opacity-100 group-hover/link:blur-none group-active/link:opacity-100 group-focus-within/link:opacity-100 group-focus-within/link:blur-none",
              )}
            >
              Go back
            </span>
          </div>
        </div>
      </Link>
      <Body2 className="mb-4 text-secondary">{project.description}</Body2>
      <TooltipGroup>
        <div className="mb-8 flex select-none">
          {project.collaborators?.map((collaborator: string, index: number) => (
            <TooltipTrigger
              content={collaborator}
              key={collaborator}
              className="group relative h-6 w-6 rounded-full border border-bg-inverted/10 outline-2 -outline-offset-1 outline-(--bg-primary) hover:!z-[9999]"
              style={{
                marginLeft: index > 0 ? "-6px" : "0",
                zIndex: (project.collaborators?.length || 0) - index + 1,
              }}
            >
              <img
                src={`/images/avatars/${collaborator.replaceAll(" ", "_").toLowerCase()}.jpg`}
                className="relative h-full w-full rounded-full object-cover group-hover:!z-[100]"
                alt={collaborator}
              />
            </TooltipTrigger>
          ))}
          <TooltipTrigger
            content="Florian Kiem"
            className="relative h-6 w-6 rounded-full border border-bg-inverted/10 outline-2 -outline-offset-1 outline-(--bg-primary) hover:z-10"
            style={{ marginLeft: "-6px" }}
          >
            <img
              src="/images/avatars/florian_kiem.webp"
              alt="Florian Kiem"
              className="h-full w-full rounded-full object-cover"
            />
          </TooltipTrigger>
        </div>
      </TooltipGroup>
    </>
  );

  return (
    <div className="w-full overflow-x-clip">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-4 md:flex-row md:px-0">
        {/* Desktop: animated collapsing info panel */}
        <motion.div
          className="hidden md:block"
          animate={
            isDesktop
              ? {
                  width: collapsed ? 0 : INFO_WIDTH,
                  opacity: collapsed ? 0 : 1,
                  x: collapsed ? -32 : 0,

                  filter: collapsed ? "blur(2px)" : "blur(0px)",
                }
              : undefined
          }
          transition={collapsed ? spring : { ...spring, opacity: { duration: 0.5, ease: "easeOut" } }}
        >
          {/* Fixed-width inner so content doesn't reflow as the outer shrinks */}
          <div style={{ width: INFO_WIDTH }} className="pr-4">
            {infoPanel}
          </div>
        </motion.div>

        {/* Mobile: static info header */}
        <div className="w-full md:hidden">{infoPanel}</div>

        {/* Main content — naturally expands as the info panel collapses */}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col items-start justify-start pt-8 transition-all duration-300 ease-out",
            collapsed ? "md:pt-64" : "",
          )}
        >
          {project.links && project.links.length > 0 && (
            <div className="sticky top-[calc(100dvh-6.75rem)] border border-black/10 z-20 mx-auto -mb-16 flex w-auto max-w-xs rounded-[10px] bg-surface-inverted shadow-xl md:top-[calc(100dvh-4.5rem)] md:flex-col">
              <div className="flex gap-0.5 p-0.5">
                {project.links?.map((link: string) => (
                  <Link
                    key={link}
                    href={link}
                    className={cn(
                      buttonVariants({ variant: "primary" }),
                      "group flex items-center gap-2 px-2 py-0.5 text-inverted",
                    )}
                  >
                    {link.replaceAll("https://", "").replaceAll("http://", "").replaceAll("www.", "").split("/")[0]}
                    <IconArrowUpRight className="ml-1 inline h-4 w-4 transition-all duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {content}
        </div>
      </div>
    </div>
  );
}
