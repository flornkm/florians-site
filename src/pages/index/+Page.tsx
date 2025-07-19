import TriangleFilled from "@/components/icons/triangle-filled";
import { Link } from "@/components/shared/link";
import Section from "@/components/shared/section";
import { usePageContext } from "vike-react/usePageContext";

export default function Page() {
  const pageContext = usePageContext();

  const projects = pageContext.data as {
    title: string;
    description: string;
    slug: string;
    date: string;
    cover: string;
  }[];

  return (
    <div className="w-full min-h-screen px-4">
      <div className="w-full max-w-5xl mx-auto">
        <Section className="items-end mb-12">
          <h1 className="font-semibold leading-tight text-lg">
            Designer by day, <br /> <span className="text-neutral-400">Engineer by night</span>
          </h1>
          <div className="w-col flex items-center justify-center">
            <h2 className="font-semibold text-lg">Latest Work</h2>
          </div>
        </Section>
        <section className="w-full flex flex-col mb-32 group/section">
          {projects.map((project) => (
            <Link
              href={`/work/${project.slug}`}
              key={project.slug}
              className="w-full grid grid-cols-[290px_1fr] items-start group/item hover:opacity-100 group-hover/section:opacity-30 transition-opacity duration-300 ease-out py-4"
            >
              <div className="flex flex-col gap-0.5 w-full items-start sticky top-16">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-neutral-500 text-sm mb-2">{project.description}</p>
                <p className="items-center pointer-events-none hidden lg:flex gap-1 group-hover/item:opacity-100 group-hover/item:ml-0 group-hover/item:blur-none opacity-0 -ml-2 blur-[1px] transition-all duration-300 ease-out focus:hidden group-focus/item:hidden">
                  <TriangleFilled className="w-4 h-4 inline-block" />
                  <span className="text-sm font-medium inline-block">Click to open</span>
                </p>
              </div>
              <div className="w-full max-w-[calc(100%-136px)] justify-self-end">
                <div className="w-full h-96 bg-neutral-100 rounded-md">
                  <img src={project.cover} alt={project.title} className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>
            </Link>
          ))}
        </section>
        <section className="w-full flex flex-col gap-8 justify-center items-center">
          <div>
            <h2 className="font-semibold text-lg text-center mb-1">Digital Guestbook</h2>
            <p className="text-neutral-400 font-medium text-sm mb-2 text-center">Send me a postcard.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
