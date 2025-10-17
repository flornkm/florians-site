import { Body2 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import Markdown from "@/components/shared/markdown.jsx";
import ScrollWheel from "@/components/shared/scroll-wheel";
import Section from "@/components/shared/section";
import { buttonVariants } from "@/components/ui/button.jsx";
import { Link } from "@/components/ui/link";
import Tooltip from "@/components/ui/tooltip";
import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils.js";
import { IconArrowUpRight } from "central-icons/IconArrowUpRight";
import { IconChevronLeft } from "central-icons/IconChevronLeft";
import { useData } from "vike-react/useData";
import type { Data } from "./+data.js";

export default function Page() {
  const project = useData<Data>();

  return (
    <div className="w-full">
      <Section as="div" className="w-full max-w-5xl md:px-0 px-4 mx-auto">
        <div className="flex-1 shrink-0">
          <Link href="/" className="w-auto flex items-start text-ms font-medium gap-2 mb-2 group/link">
            <IconChevronLeft className="w-4 h-4 mt-1.5" />
            <div className="flex-1 h-7">
              <div className="group-hover/link:translate-y-[-25.5px] transition-all duration-200 ease-out pointer-events-none">
                <H1 className="group-hover/link:blur-[1px] group-hover/link:opacity-0 transition-all duration-200 ease-out">
                  {project.title} <span className="text-neutral-400 text-ms">{project.date.split("/")[1]}</span>
                </H1>
                <span className="blur-[1px] group-hover/link:blur-none truncate opacity-0 group-hover/link:opacity-100 group-active/link:opacity-100 transition-all duration-200 ease-out focus:hidden group-focus/link:hidden">
                  Go back
                </span>
              </div>
            </div>
          </Link>
          <Body2 className="mb-4">{project.description}</Body2>
          <div className="flex mb-8 select-none">
            {project.collaborators?.map((collaborator: string, index: number) => (
              <Tooltip
                content={collaborator}
                key={collaborator}
                className="w-6 h-6 rounded-full group border border-black/10 relative outline-2 -outline-offset-1 outline-white dark:outline-black hover:!z-[9999]"
                style={{
                  marginLeft: index > 0 ? "-6px" : "0",
                  zIndex: (project.collaborators?.length || 0) - index + 1,
                }}
              >
                <img
                  src={`/images/avatars/${collaborator.replaceAll(" ", "_").toLowerCase()}.jpg`}
                  className="w-full h-full relative group-hover:!z-[100] object-cover rounded-full"
                  alt={collaborator}
                />
              </Tooltip>
            ))}
            <Tooltip
              content="Florian Kiem"
              className="w-6 h-6 hover:z-10 relative rounded-full border border-black/10 outline-2 -outline-offset-1 outline-white dark:outline-black"
              style={{ marginLeft: "-6px" }}
            >
              <img
                src="/images/avatars/florian_kiem.webp"
                alt="Florian Kiem"
                className="w-full h-full object-cover rounded-full"
              />
            </Tooltip>
          </div>
          <div className="md:sticky top-20 hidden md:block">
            <ScrollWheel html={project.html} />
          </div>
        </div>
        <div className="w-full md:max-w-[calc(100%-5rem)] pt-8 justify-self-end flex flex-col justify-start items-start h-[calc(100%+6rem)]">
          {project.links && project.links.length > 0 && (
            <div className="flex md:flex-col max-w-xs bg-black dark:bg-white z-20 rounded-[10px] mx-auto sticky w-auto top-[calc(100dvh-6.75rem)] md:top-[calc(100dvh-4.5rem)] -mb-16 shadow-xl">
              <div className="flex gap-0.5 p-0.5">
                {project.links?.map((link: string) => (
                  <Link
                    href={link}
                    className={cn(
                      buttonVariants({ variant: "tertiary" }),
                      "flex items-center px-2 py-0.5 gap-2 text-white group dark:text-black dark:hover:bg-black dark:hover:text-white",
                    )}
                  >
                    {link.replaceAll("https://", "").replaceAll("http://", "").replaceAll("www.", "").split("/")[0]}
                    <IconArrowUpRight className="w-4 h-4 inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 ease-out" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Markdown html={project.html} className={proseVariants({ variant: "default" })} />
        </div>
      </Section>
    </div>
  );
}
