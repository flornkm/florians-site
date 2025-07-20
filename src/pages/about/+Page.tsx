import { Body2, Body4 } from "@/components/design-system/body";
import { H1, H2, H3 } from "@/components/design-system/heading";
import { IconAspectRatio11 } from "central-icons/IconAspectRatio11";
import { IconSquareCheck } from "central-icons/IconSquareCheck";

import { buttonVariants } from "@/components/ui/button";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import IconArrowUpRight from "central-icons/IconArrowUpRight";
import { bucketlist } from "./const/bucketlist";
import { companies } from "./const/companies";
import { institutions } from "./const/institutions";
import { life } from "./const/life";
import { tools } from "./const/tools";
import { LogoHover } from "./logo-hover";
import { PhoneOutlines } from "./phone-outlines";

export default function Page() {
  return (
    <div className="w-full">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-0 space-y-16">
        <section className="flex flex-col items-start gap-4 mb-8">
          <div className="pb-8 w-full relative mb-4">
            <div className="-mb-8 ml-1.5 border border-neutral-200 dark:border-neutral-900 rounded-full w-28 aspect-square overflow-hidden">
              <img
                src="/images/avatars/florian_kiem.webp"
                className="w-full rounded-full transition-all duration-300 ease-out"
              />
            </div>
            <div className="absolute pointer-events-none -bottom-11 h-full w-32">
              <svg viewBox="0 0 100 50" width="100%" height="100">
                <path id="titleCurve" d="M0,35 C20,64 80,60 100,35" fill="transparent" />
                <text className="fill-neutral-800 dark:fill-white text-lg font-semibold pointer-events-auto">
                  <textPath role="h1" xlinkHref="#titleCurve" startOffset="29%" textAnchor="middle" className="text-ms">
                    About Flo
                  </textPath>
                </text>
              </svg>
              <H1 className="text-[19px] w-64 absolute bottom-[16px] left-[76px] pointer-events-auto">
                rian: <span className="text-neutral-400">An Introduction</span>
              </H1>
            </div>
          </div>
          <div className="flex flex-col gap-2 max-w-xl shrink-0 items-start">
            <Body2 className="mb-2">
              Many designers are writing about similar desires. So I just write my current thinking about the state of
              design and engineering down, and what benefits and joy it brings to me.
            </Body2>
            <Body2 className="mb-4">
              As a design engineer, my biggest strength is to translate design into code. Working in the intersection of
              those two worlds truly feels special. It doesn't only make companies more efficient by making iteration
              cycles smaller, but also helps the handoff between both teams to heal long-term, eventually resulting in
              better products and faster shipping.
            </Body2>
          </div>
          <div className="md:grid grid-cols-2 gap-8">
            <Link
              href="https://spaces.is/loversmagazine/interviews/florian-kiem"
              target="_blank"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "flex items-center gap-4 group rounded-lg p-2 pr-4",
              )}
            >
              <img
                src="/images/references/lovers-magazine-preview.webp"
                alt="Lovers Magazine Preview"
                className="w-6 rounded-sm shadow transition-all group-hover:scale-110 group-hover:-rotate-2"
              />
              <div className="flex items-center gap-2">
                <Body2 className="font-medium dark:text-white">Interview with Lovers Magazine</Body2>
                <IconArrowUpRight className="w-4 h-4 inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 ease-out" />
              </div>
            </Link>
          </div>
        </section>
        <section className="w-full mb-16">
          <H2 className="text-left mb-4">Info</H2>
          <div className="w-full grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {life.map((step, index) => (
              <div key={index} className="flex flex-col gap-2 max-w-sm">
                <div className="rounded-md aspect-square w-32 flex items-center justify-center mb-2 border border-neutral-100 dark:border-neutral-900">
                  {step.video && (
                    <video
                      src={step.video.src}
                      className="object-contain"
                      style={{
                        width: step.video.size,
                        height: step.video.size,
                      }}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="metadata"
                    />
                  )}
                </div>
                <H3 className="text-left mb-2">{step.title}</H3>
                <Body2> {step.description}</Body2>
              </div>
            ))}
          </div>
        </section>
        <section className="w-full flex flex-col justify-center">
          <H2 className="text-left mb-2">Past</H2>
          <Body2 className="max-w-xl mb-4">
            I'm very thankful for the opportunities I had in the past to work together with some of the most talented
            teams, learning from them and working on truly great products:
          </Body2>
          <HorizontalScroll>
            {companies.map((company) => (
              <LogoHover
                entity={{
                  url: company.url,
                  name: company.name,
                  logo: company.logo,
                }}
              />
            ))}
          </HorizontalScroll>
          <Body2 className="max-w-xl mb-4">
            A lot of the things I learned comes from practice which I was able to apply to my own projects at these
            institutions:
          </Body2>
          <HorizontalScroll>
            {institutions.map((institution) => (
              <LogoHover
                entity={{
                  url: institution.url,
                  name: institution.name,
                  logo: institution.logo,
                }}
              />
            ))}
          </HorizontalScroll>
        </section>
        <section>
          <H2 className="text-left mb-2">Bucketlist</H2>
          <Body2 className="max-w-xl mb-4">Things I did or aim to do in the future.</Body2>
          <div className="flex items-start gap-16">
            <ul className="space-y-3">
              {bucketlist
                .filter((item) => item.completed)
                .map((item) => (
                  <li className="flex items-start gap-1.5 text-neutral-400">
                    {item.completed ? (
                      <IconSquareCheck className="shrink-0" />
                    ) : (
                      <IconAspectRatio11 className="shrink-0" />
                    )}
                    <Body2 className="font-medium">{item.title}</Body2>
                  </li>
                ))}
            </ul>
            <ul className="space-y-3">
              {bucketlist
                .filter((item) => !item.completed)
                .map((item) => (
                  <li className="flex items-start gap-1.5">
                    {item.completed ? (
                      <IconSquareCheck className="shrink-0" />
                    ) : (
                      <IconAspectRatio11 className="shrink-0" />
                    )}
                    <Body2 className="font-medium dark:text-white">{item.title}</Body2>
                  </li>
                ))}
            </ul>
          </div>
        </section>
        <section className="flex">
          <div className="rounded-[62px] relative mx-auto">
            <PhoneOutlines className="text-neutral-300 dark:text-neutral-800" />
            <div className="absolute inset-0 px-10 py-20">
              <H2 className="text-left mb-6">Apps I use</H2>
              <div className="grid grid-cols-4 gap-6">
                {tools.map((tool) => (
                  <div>
                    <img
                      src={tool.icon}
                      alt={tool.name}
                      className="object-cover rounded-xl border border-neutral-200 dark:border-neutral-900 mb-2"
                    />
                    <Body4 className="text-center truncate">{tool.name}</Body4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
