import { Body2 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import { mdxComponents } from "@/components/shared/mdx-content";
import ScrollWheel from "@/components/shared/scroll-wheel";
import Section from "@/components/shared/section";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import Tooltip from "@/components/ui/tooltip";
import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils.js";
import { MDXProvider } from "@mdx-js/react";
import { IconArrowUpRight } from "central-icons/IconArrowUpRight";
import { IconChevronLeft } from "central-icons/IconChevronLeft";
import { ComponentType } from "react";
import { useData } from "vike-react/useData";
import type { Data } from "./+data.js";

const mdxModules = import.meta.glob("/content/work/*.mdx", { eager: true }) as Record<
  string,
  { default: ComponentType }
>;

export default function Page() {
  const project = useData<Data>();

  const modulePath = `/content/work/${project.slug}.mdx`;
  const MDXContent = mdxModules[modulePath]?.default;

  if (!MDXContent) {
    return <div>Content not found: {modulePath}</div>;
  }

  return (
    <div className="w-full">
      <Section as="div" className="mx-auto w-full max-w-5xl px-4 md:px-0">
        <div className="flex-1 shrink-0">
          <Link href="/" className="group/link mb-2 flex w-auto items-start gap-2 text-ms font-medium">
            <IconChevronLeft className="mt-1.5 h-4 w-4" />
            <div className="h-7 flex-1">
              <div className="pointer-events-none transition-all duration-200 ease-out group-hover/link:-translate-y-[25.5px] group-focus-within/link:-translate-y-[25.5px]">
                <H1 className="transition-all duration-200 ease-out group-hover/link:opacity-0 group-hover/link:blur-[1px] group-focus-within/link:opacity-0 group-focus-within/link:blur-[1px]">
                  {project.title} <span className="text-ms text-quaternary">{project.date.split("/")[1]}</span>
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
          <div className="mb-8 flex select-none">
            {project.collaborators?.map((collaborator: string, index: number) => (
              <Tooltip
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
              </Tooltip>
            ))}
            <Tooltip
              content="Florian Kiem"
              className="relative h-6 w-6 rounded-full border border-bg-inverted/10 outline-2 -outline-offset-1 outline-(--bg-primary) hover:z-10"
              style={{ marginLeft: "-6px" }}
            >
              <img
                src="/images/avatars/florian_kiem.webp"
                alt="Florian Kiem"
                className="h-full w-full rounded-full object-cover"
              />
            </Tooltip>
          </div>
          <div className="sticky top-20 hidden md:block">
            <ScrollWheel headings={project.headings} />
          </div>
        </div>
        <div className="flex h-[calc(100%+6rem)] w-full flex-col items-start justify-start justify-self-end pt-8 md:max-w-[calc(100%-5rem)]">
          {project.links && project.links.length > 0 && (
            <div className="sticky top-[calc(100dvh-6.75rem)] z-20 mx-auto -mb-16 flex w-auto max-w-xs rounded-[10px] bg-surface-inverted shadow-xl md:top-[calc(100dvh-4.5rem)] md:flex-col">
              <div className="flex gap-0.5 p-0.5">
                {project.links?.map((link: string) => (
                  <Link
                    key={link}
                    href={link}
                    className={cn(
                      buttonVariants({ variant: "tertiary" }),
                      "group flex items-center gap-2 px-2 py-0.5 text-inverted hover:text-primary",
                    )}
                  >
                    {link.replaceAll("https://", "").replaceAll("http://", "").replaceAll("www.", "").split("/")[0]}
                    <IconArrowUpRight className="ml-1 inline h-4 w-4 transition-all duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          <article className={cn(proseVariants({ variant: "default" }))}>
            <MDXProvider components={mdxComponents}>
              <MDXContent />
            </MDXProvider>
          </article>
        </div>
      </Section>
    </div>
  );
}
