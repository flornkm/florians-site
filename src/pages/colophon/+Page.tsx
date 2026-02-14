import { Body1 } from "@/components/design-system/body";
import { H1, H3 } from "@/components/design-system/heading";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils";
import { IconCentralIconSystem } from "central-icons/IconCentralIconSystem";
import { IconGithub } from "central-icons/IconGithub";
import { IconArrowUpRight } from "central-icons/IconArrowUpRight";
import { INSPIRATION } from "./const/inspiration";
import { PEOPLE } from "./const/people";

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

export default function Page() {
  return (
    <div className="w-full max-w-5xl mx-auto md:px-0 px-4">
      <div className="mb-16">
        <H1>Colophon</H1>
      </div>
      <div className="w-full z-20 md:max-w-[calc(100%-27rem)] justify-self-end space-y-2 sticky top-[calc(100dvh-6.75rem)] md:top-[calc(100dvh-4.5rem)] -mb-16 ">
        <div className="flex md:flex-col bg-surface-inverted rounded-[10px] mx-auto w-fit shadow-xl">
          <div className="flex gap-0.5 p-0.5">
            <Link
              href="https://github.com/flornkm/florians-site"
              target="_blank"
              className={cn(
                buttonVariants({ variant: "tertiary" }),
                "group flex items-center px-2 py-0.5 gap-2 text-inverted hover:text-primary",
              )}
            >
              <IconGithub className="size-4" />
              Open Source Repo
              <IconArrowUpRight className="ml-1 inline h-4 w-4 transition-all duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
      <section className="w-full relative min-h-screen">
        <div className="flex items-start justify-between">
          <H3 className="w-40 shrink-0">Tech Stack</H3>
          <div
            className={cn(
              "w-full md:max-w-[calc(100%-27rem)] justify-self-end space-y-2",
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
              <Link href="https://vike.dev" target="_blank">
                Vike
              </Link>
            </Body1>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <H3 className="w-40 shrink-0">Typography</H3>
          <div
            className={cn(
              "w-full md:max-w-[calc(100%-27rem)] justify-self-end space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              Sans:{" "}
              <Link href="https://github.com/fonts-archive/Pretendard" target="_blank">
                Pretendard
              </Link>
            </Body1>
            <Body1 className="font-mono">
              Mono:{" "}
              <Link href="https://commitmono.com/" target="_blank">
                Commit Mono
              </Link>
            </Body1>
            <Body1 className="font-round">
              Round:{" "}
              <Link href="https://github.com/lauridskern/open-runde" target="_blank">
                Open Runde
              </Link>
            </Body1>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <H3 className="w-40 shrink-0">Icons</H3>
          <div
            className={cn(
              "w-full md:max-w-[calc(100%-27rem)] justify-self-end space-y-2",
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
        <div className="flex items-start justify-between">
          <H3 className="w-40 shrink-0">Mockups</H3>
          <div
            className={cn(
              "w-full md:max-w-[calc(100%-27rem)] justify-self-end space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              Photos:{" "}
              <Link href="https://artboard.studio/" target="_blank">
                Artboards Studio
              </Link>
            </Body1>
            <Body1>
              Videos:{" "}
              <Link href="https://screen.studio/" target="_blank">
                Screen Studio
              </Link>
            </Body1>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <H3 className="w-40 shrink-0">UI</H3>
          <div
            className={cn(
              "w-full md:max-w-[calc(100%-27rem)] justify-self-end space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              Many elements are self-created for practice purposes. Obviously,{" "}
              <Link href="https://ui.shadcn.com/" target="_blank">
                shadcn/ui
              </Link>{" "}
              or{" "}
              <Link href="https://base-ui.com/" target="_blank">
                Base UI
              </Link>{" "}
              is a good starting point if you want to create custom components and a big inspiration.
            </Body1>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <H3 className="w-40 shrink-0">Special Packages</H3>
          <div
            className={cn(
              "w-full md:max-w-[calc(100%-27rem)] justify-self-end space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              3D:{" "}
              <Link href="https://threejs.org/" target="_blank">
                ThreeJS
              </Link>{" "}
              and{" "}
              <Link href="https://react-three-fiber.org/" target="_blank">
                https://globe.gl/
              </Link>
            </Body1>
            <Body1>
              Animations: Pure{" "}
              <Link href="https://tailwindcss.com/" target="_blank">
                Tailwind
              </Link>{" "}
              or{" "}
              <Link href="https://rive.app/" target="_blank">
                Rive
              </Link>
            </Body1>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <H3 className="w-40 shrink-0">Hosting</H3>
          <div
            className={cn(
              "w-full md:max-w-[calc(100%-27rem)] justify-self-end space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              App:{" "}
              <Link href="https://vercel.com/" target="_blank">
                Vercel
              </Link>
            </Body1>
            <Body1>
              Postcards:{" "}
              <Link href="https://firebase.google.com/" target="_blank">
                Firebase
              </Link>
            </Body1>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <H3 className="w-40 shrink-0">AI</H3>
          <div
            className={cn(
              "w-full md:max-w-[calc(100%-27rem)] justify-self-end space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              Package:{" "}
              <Link href="https://www.ai-sdk.dev/" target="_blank">
                AI SDK
              </Link>
            </Body1>
            <Body1>
              Provider:{" "}
              <Link href="https://openai.com/" target="_blank">
                OpenAI
              </Link>
            </Body1>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <H3 className="w-40 shrink-0">Inspiration</H3>
          <div
            className={cn(
              "w-full md:max-w-[calc(100%-27rem)] justify-self-end space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              The following sites contain parts which were used as inspiration: {renderLinkedList(INSPIRATION)}.
            </Body1>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <H3 className="w-40 shrink-0">Great people</H3>
          <div
            className={cn(
              "w-full md:max-w-[calc(100%-27rem)] justify-self-end space-y-2",
              proseVariants({ variant: "default" }),
            )}
          >
            <Body1>
              The following is a list of people that I got to know, are my friends, build something great, or I find
              simply inspirational. Make sure to check them out: {renderLinkedList(PEOPLE)}.
            </Body1>
          </div>
        </div>
      </section>
    </div>
  );
}
