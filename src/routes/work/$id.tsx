import { Body2 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import { Image } from "@/components/shared/image";
import { useMdxContent } from "@/components/shared/mdx-content";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { TooltipGroup, TooltipTrigger } from "@/components/ui/tooltip";
import { useScrollThreshold } from "@/hooks/use-scroll-threshold";
import { getContent, isWorkEntry, type WorkEntry } from "@/lib/mdx";
import { cn } from "@/lib/utils";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { IconArrowUpRight } from "central-icons/IconArrowUpRight";
import { IconChevronLeft } from "central-icons/IconChevronLeft";
import { motion } from "motion/react";
import { useSyncExternalStore } from "react";

const getProject = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const projects = await getContent("work");
    const projectRaw = projects.find((p) => p.slug === slug);

    if (!projectRaw) {
      throw notFound();
    }

    if (!isWorkEntry(projectRaw)) {
      throw new Error(`Project ${slug} is missing required fields`);
    }

    const project: WorkEntry = projectRaw;

    const collaborators =
      typeof project.collaborators === "string"
        ? project.collaborators.split(",").map((item: string) => item.trim())
        : project.collaborators || [];

    const links =
      typeof project.links === "string"
        ? project.links.split(",").map((item: string) => item.trim())
        : project.links || [];

    return {
      slug: project.slug,
      title: project.title,
      description: project.description,
      collaborators,
      links,
      date: project.date,
    };
  });

export const Route = createFileRoute("/work/$id")({
  loader: ({ params }) => getProject({ data: params.id }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      meta: [
        { title: `${loaderData.title} • Florian - Design Engineer` },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:image", content: `/api/og?title=${encodeURIComponent(loaderData.title)}` },
        { name: "twitter:title", content: loaderData.title },
        { name: "twitter:description", content: loaderData.description },
      ],
    };
  },
  component: WorkPage,
});

const INFO_WIDTH = 440;
const SCROLL_THRESHOLD = 80;
const spring = { type: "spring" as const, stiffness: 180, damping: 24, mass: 1 };

function WorkPage() {
  const project = Route.useLoaderData();

  const isDesktop = useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia("(min-width: 768px)");
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );

  const collapsed = useScrollThreshold(SCROLL_THRESHOLD);

  const content = useMdxContent("work", project.slug);

  if (!content) {
    return <div>Content not found</div>;
  }

  const infoPanel = (
    <>
      <Link href="/" className="group/link mb-2 flex w-auto items-start gap-2 text-sm font-medium">
        <IconChevronLeft className="mt-1.5 h-4 w-4" />
        <div className="h-7 flex-1 mt-0.5">
          <div className="pointer-events-none transition-all duration-200 ease-out sm:group-hover/link:-translate-y-[22.5px] sm:group-focus-within/link:-translate-y-[22.5px]">
            <H1 className="transition-all duration-200 ease-out group-hover/link:opacity-0 sm:group-hover/link:blur-[1px] sm:group-focus-within/link:opacity-0 sm:group-focus-within/link:blur-[1px]">
              {project.title} <span className="text-sm text-quaternary">{project.date}</span>
            </H1>
            <span
              className={cn(
                "truncate opacity-0 blur-[1px] hidden sm:block transition-all duration-200 ease-out focus:hidden",
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
              <Image
                src={`/images/avatars/${collaborator.replaceAll(" ", "_").toLowerCase()}.jpg`}
                alt={collaborator}
                className="relative h-full w-full rounded-full group-hover:!z-[100]"
              />
            </TooltipTrigger>
          ))}
          <TooltipTrigger
            content="Florian Kiem"
            className="relative h-6 w-6 rounded-full border border-bg-inverted/10 outline-2 -outline-offset-1 outline-(--bg-primary) hover:z-10"
            style={{ marginLeft: "-6px" }}
          >
            <Image
              src="/images/avatars/florian_kiem.jpg"
              alt="Florian Kiem"
              className="h-full w-full rounded-full"
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
          transition={
            collapsed ? spring : { ...spring, opacity: { duration: 0.5, ease: "easeOut" } }
          }
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
                    {
                      link
                        .replaceAll("https://", "")
                        .replaceAll("http://", "")
                        .replaceAll("www.", "")
                        .split("/")[0]
                    }
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
