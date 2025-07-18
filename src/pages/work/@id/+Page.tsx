import { proseVariants } from "@/lib/prose-variants";
import { useData } from "vike-react/useData";
import ArrowTopRight from "../../../components/icons/arrow-top-right";
import ChevronLeft from "../../../components/icons/chevron-left";
import { Link } from "../../../components/shared/link";
import ScrollWheel from "../../../components/shared/scroll-wheel";
import Section from "../../../components/shared/section";
import Tooltip from "../../../components/shared/tooltip";
import type { Data } from "./+data.js";

export default function Page() {
  const project = useData<Data>();

  return (
    <div className="w-full px-4">
      <Section as="div" className="w-full max-w-5xl mx-auto">
        <div className="flex-1 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="w-auto flex items-center gap-1 text-sm font-medium group/link">
              <ChevronLeft className="w-4 h-4" />
              <span className="group-hover/link:visible blur-[1px] group-hover/link:blur-none invisible truncate -ml-2 opacity-0 group-hover/link:opacity-100 group-hover/link:ml-0 max-w-0 group-hover/link:max-w-20 transition-all duration-500 ease-out focus:hidden group-focus/link:hidden">
                Go back
              </span>
            </Link>
            <h1 className="font-semibold">
              {project.title} <span className="text-neutral-400 text-sm">{project.date.split("/")[1]}</span>
            </h1>
          </div>
          <p className="text-sm text-neutral-500 mb-4">{project.description}</p>
          <div className="flex mb-8 select-none">
            {project.collaborators.map((collaborator, index) => (
              <Tooltip
                content={collaborator}
                key={collaborator}
                className="w-6 h-6 rounded-full border border-black/10 relative outline-2 -outline-offset-1 outline-white"
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
              className="w-6 h-6 rounded-full border border-black/10 outline-2 -outline-offset-1 outline-white"
              style={{ marginLeft: "-6px" }}
            >
              <img
                src="/images/avatars/florian_kiem.webp"
                alt="Florian Kiem"
                className="w-full h-full object-cover rounded-full"
              />
            </Tooltip>
          </div>
          <div className="sticky top-20">
            <ScrollWheel html={project.html} />
          </div>
        </div>
        <div className="w-full max-w-[calc(100%-76px)] justify-self-end">
          <article className={proseVariants.default} dangerouslySetInnerHTML={{ __html: project.html }} />
          <div className="w-full flex flex-col items-start">
            <h2 className="font-semibold mb-2">Related links</h2>
            <div className="flex gap-0.5 bg-neutral-100 p-0.5 rounded-[10px] overflow-hidden">
              {project.links.map((link) => (
                <Link
                  href={link}
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-white hover:bg-neutral-50 transition-all group"
                >
                  {link.replaceAll("https://", "").replaceAll("http://", "").replaceAll("www.", "").split("/")[0]}
                  <ArrowTopRight className="w-4 h-4 inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 ease-out" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
