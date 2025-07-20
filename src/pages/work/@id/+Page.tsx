import { Body2 } from "@/components/design-system/body";
import { H1, H2 } from "@/components/design-system/heading";
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
    <div className="w-full px-4">
      <Section as="div" className="w-full max-w-5xl mx-auto">
        <div className="flex-1 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="w-auto flex items-center gap-1 text-ms font-medium group/link">
              <IconChevronLeft className="w-4 h-4" />
              <span className="group-hover/link:visible blur-[1px] group-hover/link:blur-none invisible truncate -ml-2 opacity-0 group-hover/link:opacity-100 group-hover/link:ml-0 max-w-0 group-hover/link:max-w-20 transition-all duration-500 ease-out focus:hidden group-focus/link:hidden">
                Go back
              </span>
            </Link>
            <H1>
              {project.title} <span className="text-neutral-400 text-ms">{project.date.split("/")[1]}</span>
            </H1>
          </div>
          <Body2 className="mb-4">{project.description}</Body2>
          <div className="flex mb-8 select-none">
            {project.collaborators.map((collaborator, index) => (
              <Tooltip
                content={collaborator}
                key={collaborator}
                className="w-6 h-6 rounded-full border border-black/10 relative outline-2 -outline-offset-1 outline-white dark:outline-black"
                style={{ marginLeft: index > 0 ? "-6px" : "0", zIndex: project.collaborators.length - index + 1 }}
              >
                <img
                  src={`/images/avatars/${collaborator.replaceAll(" ", "_").toLowerCase()}.jpg`}
                  className="w-full h-full object-cover rounded-full"
                  alt={collaborator}
                />
              </Tooltip>
            ))}
            <Tooltip
              content="Florian Kiem"
              className="w-6 h-6 rounded-full border border-black/10 outline-2 -outline-offset-1 outline-white dark:outline-black"
              style={{ marginLeft: "-6px" }}
            >
              <img
                src="/images/avatars/florian_kiem.webp"
                alt="Florian Kiem"
                className="w-full h-full object-cover rounded-full"
              />
            </Tooltip>
          </div>
          <div className="md:sticky top-20 hidden">
            <ScrollWheel html={project.html} />
          </div>
        </div>
        <div className="w-full md:max-w-[calc(100%-76px)] justify-self-end flex flex-col justify-start items-start h-[calc(100%+6rem)]">
          <div className="flex flex-col items-start bg-black dark:bg-white rounded-[10px] mx-auto sticky md:w-auto w-full top-[calc(100dvh-9rem)] md:top-[calc(100dvh-6rem)] -mb-16 shadow-xl">
            <H2 className="mb-1.5 text-white px-2 pt-1 dark:text-black">Related links</H2>
            <div className="flex gap-0.5 p-0.5 overflow-hidden">
              {project.links.map((link) => (
                <Link
                  href={link}
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "flex items-center gap-2 bg-white group hover:bg-neutral-50 dark:bg-black dark:hover:bg-neutral-900 dark:text-white",
                  )}
                >
                  {link.replaceAll("https://", "").replaceAll("http://", "").replaceAll("www.", "").split("/")[0]}
                  <IconArrowUpRight className="w-4 h-4 inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 ease-out" />
                </Link>
              ))}
            </div>
          </div>
          <article className={proseVariants.default} dangerouslySetInnerHTML={{ __html: project.html }} />
        </div>
      </Section>
    </div>
  );
}
