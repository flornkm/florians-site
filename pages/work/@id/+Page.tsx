import { useData } from "vike-react/useData";
import ScrollWheel from "../../../components/shared/scroll-wheel";
import Section from "../../../components/shared/section";
import { Link } from "../../../components/ui/link";
import Tooltip from "../../../components/ui/tooltip";
import ChevronLeft from "../../../icons/chevron-left";
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
                alt="Flornkm"
                className="w-full h-full object-cover rounded-full"
              />
            </Tooltip>
          </div>
          <div className="sticky top-20">
            <ScrollWheel html={project.html} />
          </div>
        </div>
        <div className="w-full max-w-[calc(100%-120px)] justify-self-end">
          <article
            className="prose prose-img:max-w-xl prose-p:text-neutral-500 prose-h1:text-lg prose-h1:font-semibold prose-h2:text-base prose-h2:font-semibold prose-h3:text-sm prose-h3:font-semibold prose-p:text-sm prose-p:font-normal"
            dangerouslySetInnerHTML={{ __html: project.html }}
          />
        </div>
      </Section>
    </div>
  );
}
