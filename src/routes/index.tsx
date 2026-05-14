import { Body2 } from "@/components/design-system/body";
import { H1, H2, H3 } from "@/components/design-system/heading";
import { Image } from "@/components/shared/image";
import TriangleFilled from "@/components/shared/triangle-filled";
import { LetterStack } from "@/features/letters/components/letter-stack";

import Button from "@/components/ui/button";
import { Link } from "@/components/ui/link";

import { COMPANIES } from "@/features/about/const/companies";
import { cn } from "@/lib/utils";

import { getContent } from "@/lib/mdx";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { IconPencil } from "central-icons/IconPencil";

const getProjects = createServerFn().handler(async () => {
  const projects = await getContent("work");
  return projects;
});

export const Route = createFileRoute("/")({
  loader: () => getProjects(),
  head: () => ({
    meta: [{ property: "og:image", content: "/api/og?title=Work" }],
  }),
  component: IndexPage,
});

function IndexPage() {
  const projects = Route.useLoaderData() as {
    title: string;
    description: string;
    slug: string;
    date: string;
    cover: string | string[];
  }[];
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="w-full max-w-5xl md:px-0 px-4 mx-auto">
        <section className="w-full md:grid grid-cols-[336px_1fr] gap-4 items-end md:mb-12">
          <H1 className="leading-tight md:mb-0 mb-10">
            Designer by day, <br /> <span className="text-quaternary">Engineer by night</span>
          </H1>
          <div className="w-col md:flex items-center justify-center">
            <H2 className="mb-2.5 md:mb-5">Latest Work</H2>
          </div>
        </section>
        <section className="w-full flex flex-col mb-12 group/section">
          {projects.map((project) => (
            <Link
              href={`/work/${project.slug}`}
              key={project.slug}
              className="w-full md:grid grid-cols-[290px_1fr] items-start group/item py-4"
            >
              <div className="flex flex-col gap-0.5 w-full items-start md:sticky top-16">
                <H3 className="relative transition-[padding] duration-200 ease-out [@media(hover:hover)]:lg:group-hover/item:pl-3">
                  <span
                    className={cn(
                      "hidden [@media(hover:hover)]:lg:inline-flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 origin-left opacity-0 scale-90 blur-[2px] transition-all duration-200 ease-out",
                      "[@media(hover:hover)]:group-hover/item:translate-x-0 [@media(hover:hover)]:group-hover/item:opacity-100 [@media(hover:hover)]:group-hover/item:scale-100 [@media(hover:hover)]:group-hover/item:blur-none",
                    )}
                  >
                    <TriangleFilled className="size-4" />
                  </span>
                  {project.title}
                </H3>
                <Body2 className="mb-5 md:mb-3 text-tertiary">{project.description}</Body2>
              </div>
              <div className="w-full md:max-w-[calc(100%-136px)] justify-self-end">
                {Array.isArray(project.cover) ? (
                  <div className="w-full bg-secondary p-2 py-4 md:py-8 md:p-8 rounded-md flex gap-3">
                    {project.cover.map((src) => (
                      <div key={src} className="flex-1 min-w-0 px-2 @container">
                        <Image
                          src={src}
                          alt={project.title}
                          objectFit="contain"
                          className="w-full h-auto rounded-[16cqi] outline -outline-offset-1 outline-black/5 dark:outline-white/15"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full bg-secondary p-4 md:p-8 rounded-md flex items-center">
                    <Image
                      src={project.cover}
                      alt={project.title}
                      className="w-full h-auto rounded-sm outline -outline-offset-1 outline-black/5 dark:outline-white/15"
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </section>
        <section className="w-full mb-12 flex flex-col md:gap-0 gap-4 md:grid grid-cols-[290px_1fr] items-start">
          <div className="md:sticky top-16">
            <H3>Teams I was fortunate to ship with</H3>
          </div>
          <div className="w-full md:max-w-[calc(100%-136px)] justify-self-end">
            <div className="flex flex-col group/companies">
              {COMPANIES.map((company) => {
                const [start, end] = company.date.split(/\s*[–-]\s*/);
                const displayDate = end ? company.date : `${start} – ${start}`;
                return company.url ? (
                  <a
                    key={company.name}
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-between py-2 px-3 -mx-3 group/company [@media(hover:hover)]:hover:opacity-100 [@media(hover:hover)]:group-hover/companies:opacity-30 transition-opacity duration-300 ease-out"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-md bg-secondary opacity-0 scale-[0.99] transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover/company:opacity-100 [@media(hover:hover)]:group-hover/company:scale-100"
                    />
                    <span className="relative text-sm font-medium">{company.name}</span>
                    <span className="relative text-sm text-tertiary tabular-nums">
                      {displayDate}
                    </span>
                  </a>
                ) : (
                  <div
                    key={company.name}
                    className="flex items-center justify-between py-2 px-3 -mx-3"
                  >
                    <span className="text-sm font-medium">{company.name}</span>
                    <span className="text-sm text-tertiary tabular-nums">{displayDate}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <section
          id="letters"
          className="w-screen py-24 relative left-1/2 -translate-x-1/2 overflow-hidden flex flex-col gap-8 justify-center items-center mask-y-from-95% mask-y-to-100%"
        >
          <div className="flex flex-col items-center justify-center w-full md:px-0 px-4 md:w-auto">
            <div className="md:mb-2 min-[450px]:mb-0 mb-8">
              <H2 className="text-center mb-0.5">Digital Guestbook</H2>
              <Body2 className="text-quaternary md:mb-2.5 text-center">
                Last three letters sent to this site.
              </Body2>
            </div>
            <div className="min-[450px]:mt-[16vw] md:mt-0 w-full">
              <LetterStack />
            </div>
            <Button
              variant="secondary"
              className="mt-4 mx-auto"
              prefix={<IconPencil />}
              onClick={() => {
                navigate({ to: "/send-postcard" });
              }}
            >
              Send Postcard
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
