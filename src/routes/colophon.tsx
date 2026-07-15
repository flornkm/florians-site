import { Body1 } from "@/components/design-system/body";
import { H1, H3 } from "@/components/design-system/heading";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { INSPIRATION } from "@/features/colophon/const/inspiration";
import { PEOPLE } from "@/features/colophon/const/people";
import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { IconArrowUpRight } from "central-icons/IconArrowUpRight";
import { IconCentralIconSystem } from "central-icons/IconCentralIconSystem";
import { IconGithub } from "central-icons/IconGithub";

function renderLinkedList(items: { name: string; href: string }[]) {
  return items.map((item, i, arr) => (
    <span key={item.name}>
      <Link href={item.href} target="_blank">
        {item.name}
      </Link>
      {i < arr.length - 1 && (arr.length > 2 ? (i === arr.length - 2 ? ", and " : ", ") : " and ")}
    </span>
  ));
}

export const Route = createFileRoute("/colophon")({
  head: () => ({
    meta: [
      { title: "Colophon ‹ Florian Kiem, Design, Code" },
      {
        name: "description",
        content:
          "The colophon page of Florian provides information about the website, tech stack, inspiration as well as credits.",
      },
      { property: "og:title", content: "Colophon" },
      {
        property: "og:description",
        content:
          "The colophon page of Florian provides information about the website, tech stack, inspiration as well as credits.",
      },
      { property: "og:image", content: "/api/og?title=Colophon" },
      { name: "twitter:title", content: "Colophon" },
      {
        name: "twitter:description",
        content:
          "The colophon page of Florian provides information about the website, tech stack, inspiration as well as credits.",
      },
      { name: "twitter:image", content: "/api/og?title=Colophon" },
    ],
  }),
  component: ColophonPage,
});

function ColophonPage() {
  return (
    <div className="w-full">
      <div className="mb-16 grid grid-cols-9 gap-x-6">
        <H1 className="col-start-1 col-span-9 md:col-start-3 md:col-span-2">Colophon</H1>
      </div>
      <div className="sticky top-[calc(100dvh-6.75rem)] border border-black/10 z-20 mx-auto -mb-16 flex w-fit rounded-[10px] bg-surface-inverted shadow-xl md:top-[calc(100dvh-4.5rem)] md:max-w-[calc(100%-27rem)] md:justify-self-end md:flex-col">
        <div className="flex gap-0.5 p-0.5">
          <Link
            href="https://github.com/flornkm/florians-site"
            target="_blank"
            className={cn(
              buttonVariants({ variant: "primary" }),
              "group w-auto shrink-0 self-center md:self-auto flex items-center gap-2 px-2 py-0.5 text-inverted",
            )}
          >
            <IconGithub className="size-4" />
            Open Source Repo
            <IconArrowUpRight className="ml-1 inline h-4 w-4 transition-all duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
      <section className="w-full relative min-h-screen">
        <div className="grid grid-cols-9 gap-x-6 items-start">
          <H3 className="col-span-9 md:col-start-1 md:col-span-2">Tech Stack</H3>
          <div
            className={cn(
              "col-span-9 md:col-start-3 md:col-span-2 space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              <Link href="https://react.dev" target="_blank">
                React
              </Link>
              ,{" "}
              <Link href="https://vitejs.dev" target="_blank">
                Vite
              </Link>
              , and{" "}
              <Link href="https://tanstack.com/start" target="_blank">
                TanStack Start
              </Link>
            </Body1>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-x-6 items-start">
          <H3 className="col-span-9 md:col-start-1 md:col-span-2">Typography</H3>
          <div
            className={cn(
              "col-span-9 md:col-start-3 md:col-span-2 space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              Sans:{" "}
              <Link href="https://www.daltonmaag.com/font-library/haas-recast.html" target="_blank">
                Haas Recast
              </Link>
            </Body1>
            <Body1 className="font-serif italic">
              Serif:{" "}
              <Link href="https://www.dblzr.com/fonts/00-wagram" target="_blank">
                Wagram
              </Link>
            </Body1>
            <Body1 className="font-mono">
              Mono:{" "}
              <Link href="https://commitmono.com/" target="_blank">
                Commit Mono
              </Link>
            </Body1>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-x-6 items-start">
          <H3 className="col-span-9 md:col-start-1 md:col-span-2">Icons</H3>
          <div
            className={cn(
              "col-span-9 md:col-start-3 md:col-span-2 space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              Using the{" "}
              <Link href="https://centralicons.com/" target="_blank">
                <IconCentralIconSystem className="size-4 -mt-1 inline-block" /> Central Icon System
              </Link>{" "}
              (and their amazing npm package).
            </Body1>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-x-6 items-start">
          <H3 className="col-span-9 md:col-start-1 md:col-span-2">Mockups</H3>
          <div
            className={cn(
              "col-span-9 md:col-start-3 md:col-span-2 space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              Photos:{" "}
              <Link href="https://artboard.studio/" target="_blank">
                Artboards Studio
              </Link>
            </Body1>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-x-6 items-start">
          <H3 className="col-span-9 md:col-start-1 md:col-span-2">UI</H3>
          <div
            className={cn(
              "col-span-9 md:col-start-3 md:col-span-2 space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              Using{" "}
              <Link href="https://base-ui.com/" target="_blank">
                Base UI
              </Link>{" "}
              for this portfolio.
            </Body1>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-x-6 items-start">
          <H3 className="col-span-9 md:col-start-1 md:col-span-2">Special Packages</H3>
          <div
            className={cn(
              "col-span-9 md:col-start-3 md:col-span-2 space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              Animations: Pure{" "}
              <Link href="https://tailwindcss.com/" target="_blank">
                Tailwind
              </Link>{" "}
              or{" "}
              <Link href="https://motion.dev/" target="_blank">
                Motion
              </Link>
            </Body1>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-x-6 items-start">
          <H3 className="col-span-9 md:col-start-1 md:col-span-2">Hosting</H3>
          <div
            className={cn(
              "col-span-9 md:col-start-3 md:col-span-2 space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              App:{" "}
              <Link href="https://vercel.com/" target="_blank">
                Vercel
              </Link>
            </Body1>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-x-6 items-start">
          <H3 className="col-span-9 md:col-start-1 md:col-span-2">Inspiration</H3>
          <div
            className={cn(
              "col-span-9 md:col-start-3 md:col-span-2 space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              The following sites contain parts which were used as inspiration:{" "}
              {renderLinkedList(INSPIRATION)}.
            </Body1>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-x-6 items-start">
          <H3 className="col-span-9 md:col-start-1 md:col-span-2">Great people</H3>
          <div
            className={cn(
              "col-span-9 md:col-start-3 md:col-span-2 space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              The following is a list of people that I got to know, are my friends, build something
              great, or I find simply inspirational. Make sure to check them out:{" "}
              {renderLinkedList(PEOPLE)}.
            </Body1>
          </div>
        </div>
      </section>
    </div>
  );
}
