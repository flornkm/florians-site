import { Body2 } from "@/components/design-system/body";
import { H1, H2, H3 } from "@/components/design-system/heading";
import TriangleFilled from "@/components/icons/triangle-filled";
import { LetterStack } from "@/components/letters/letter-stack";

import Button from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

import { IconPencil } from "central-icons/IconPencil";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";

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
              className="w-full md:grid grid-cols-[290px_1fr] items-start group/item hover:opacity-100 group-hover/section:opacity-30 transition-opacity duration-300 ease-out py-4"
            >
              <div className="flex flex-col gap-0.5 w-full items-start md:sticky top-16">
                <H3>{project.title}</H3>
                <Body2 className="mb-5 md:mb-3 text-tertiary">{project.description}</Body2>
                <p
                  className={cn(
                    "items-center pointer-events-none hidden lg:flex gap-1 opacity-0 -ml-2 blur-[1px] transition-all duration-150 ease-out focus:hidden",
                    "group-hover/item:opacity-100 group-hover/item:ml-0 group-hover/item:blur-none",
                    "group-focus-within/item:opacity-100 group-focus-within/item:ml-0 group-focus-within/item:blur-none",
                    "group-active/item:opacity-100",
                  )}
                >
                  <TriangleFilled className="size-4 inline-block" />
                  <span className="text-sm font-medium inline-block">Click to open</span>
                </p>
              </div>
              <div className="w-full md:max-w-[calc(100%-136px)] justify-self-end">
                <div className="w-full bg-secondary p-8 rounded-md flex items-center">
                  <img src={project.cover} alt={project.title} className="w-full h-auto object-cover rounded-sm" />
                </div>
              </div>
            </Link>
          ))}
        </section>
        <section
          id="letters"
          className="w-screen py-24 relative left-1/2 -translate-x-1/2 overflow-hidden flex flex-col gap-8 justify-center items-center mask-y-from-95% mask-y-to-100%"
        >
          <div className="flex flex-col items-center justify-center w-full md:px-0 px-4 md:w-auto">
            <div className="md:mb-2">
              <H2 className="text-center mb-0.5">Digital Guestbook</H2>
              <Body2 className="text-quaternary md:mb-2.5 text-center">Last three letters sent to this site.</Body2>
            </div>
            <div className="min-[450px]:mt-[16vw] md:mt-0 w-full">
              <LetterStack />
            </div>
            <Button
              variant="secondary"
              className="mt-4 mx-auto"
              prefix={<IconPencil />}
              onClick={() => {
                navigate("/send-postcard");
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
