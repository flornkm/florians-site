import { Body2 } from "@/components/design-system/body";
import { H1, H2, H3 } from "@/components/design-system/heading";
import TriangleFilled from "@/components/icons/triangle-filled";
import Section from "@/components/shared/section";
import { Link } from "@/components/ui/link";
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
    <div className="w-full">
      <div className="w-full max-w-5xl px-4 mx-auto">
        <Section className="items-end md:mb-12">
          <H1 className="leading-tight md:mb-3 mb-10">
            Designer by day, <br /> <span className="text-neutral-400 dark:text-neutral-500">Engineer by night</span>
          </H1>
          <div className="w-col md:flex items-center justify-center">
            <H2 className="mb-2.5">Latest Work</H2>
          </div>
        </Section>
        <section className="w-full flex flex-col mb-32 group/section">
          {projects.map((project) => (
            <Link
              href={`/work/${project.slug}`}
              key={project.slug}
              className="w-full md:grid grid-cols-[290px_1fr] items-start group/item hover:opacity-100 group-hover/section:opacity-30 transition-opacity duration-300 ease-out py-4"
            >
              <div className="flex flex-col gap-0.5 w-full items-start md:sticky top-16">
                <H3 className="mb-1">{project.title}</H3>
                <Body2 className="mb-2">{project.description}</Body2>
                <p className="items-center pointer-events-none hidden lg:flex gap-1 group-hover/item:opacity-100 group-hover/item:ml-0 group-hover/item:blur-none opacity-0 -ml-2 blur-[1px] transition-all duration-300 ease-out focus:hidden group-focus/item:hidden">
                  <TriangleFilled className="w-4 h-4 inline-block" />
                  <span className="text-ms font-medium inline-block">Click to open</span>
                </p>
              </div>
              <div className="w-full md:max-w-[calc(100%-136px)] justify-self-end">
                <div className="w-full h-96 bg-neutral-100 dark:bg-neutral-950 rounded-md">
                  <img src={project.cover} alt={project.title} className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>
            </Link>
          ))}
        </section>
        <section className="w-full flex flex-col gap-8 justify-center items-center">
          <div>
            <H2 className="text-center mb-2.5">Digital Guestbook</H2>
            <Body2 className="text-neutral-400 font-medium mb-2.5 text-center">Send me a postcard.</Body2>
          </div>
        </section>
      </div>
    </div>
  );
}
