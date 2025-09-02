import { Body2, Body3, Body4 } from "@/components/design-system/body";
import { H1, H2, H3 } from "@/components/design-system/heading";
import { IconAspectRatio11 } from "central-icons/IconAspectRatio11";
import { IconSquareCheck } from "central-icons/IconSquareCheck";
import { useRef } from "react";
import type { GlobeMethods } from "react-globe.gl";

import countriesData from "@/assets/data/countries.json";
import { buttonVariants } from "@/components/ui/button";
import { Globe } from "@/components/ui/globe";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { Link } from "@/components/ui/link";
import { LogoHover } from "@/components/ui/logo-hover";
import { cn } from "@/lib/utils";
import IconArrowUpRight from "central-icons/IconArrowUpRight";
import { BUCKETLIST } from "./const/bucketlist";
import { COMPANIES } from "./const/companies";
import { INSTITUTIONS } from "./const/institutions";
import { LIFE } from "./const/life";
import { TOOLS } from "./const/tools";
import { VISITED_COUNTRIES, VISITED_COUNTRY_NAMES } from "./const/visited-countries";

interface CountryProperties {
  name?: string;
  NAME?: string;
  ADMIN?: string;
  admin?: string;
}

interface GeoJSONFeature {
  type: "Feature";
  properties: CountryProperties;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

export default function Page() {
  const globeRef = useRef<GlobeMethods>(null);
  // Static import - no loading state needed, data available immediately
  const countries = countriesData.features as GeoJSONFeature[];

  // Helper functions for polygon styling
  const getCountryName = (feat: object): string => {
    const feature = feat as GeoJSONFeature;
    return (
      feature.properties.name || feature.properties.NAME || feature.properties.ADMIN || feature.properties.admin || ""
    );
  };

  const isCountryVisited = (feat: object): boolean => {
    const countryName = getCountryName(feat);
    return VISITED_COUNTRY_NAMES.has(countryName);
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-0 space-y-16">
        <section className="flex flex-col items-start gap-4 mb-12">
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
              <div className="flex items-center gap-2 truncate">
                <Body2 className="font-medium dark:text-white truncate">Interview with Lovers Magazine</Body2>
                <IconArrowUpRight className="w-4 h-4 inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 ease-out" />
              </div>
            </Link>
          </div>
        </section>
        <section className="w-full mb-16">
          <div className="w-full grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {LIFE.map((step, index) => (
              <div key={index} className="flex flex-col gap-2 max-w-sm">
                <div className="h-20 w-20 aspect-square flex items-center justify-center rounded-lg">
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
                <H3 className="text-left">{step.title}</H3>
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
            {COMPANIES.map((company) => (
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
            {INSTITUTIONS.map((institution) => (
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
        <section className="grid md:grid-cols-2">
          <div className="mb-8 md:mb-0">
            <H2 className="text-left mb-2">Countries visited</H2>
            <div className="flex items-center gap-2">
              <div className="bg-rose-500 rounded-sm size-3" />
              <Body3 className="font-medium text-black">{VISITED_COUNTRIES.length} visited</Body3>
            </div>
            <div className="mask-radial-[45%_60%] overflow-hidden mask-radial-from-50% min-h-56 w-full flex items-center justify-center">
              <Globe
                ref={globeRef}
                width={212}
                height={212}
                globeImageUrl="/images/earth-texture.jpg"
                showAtmosphere={false}
                globeCurvatureResolution={8}
                animateIn={true}
                // Explicitly disable HTML elements
                htmlElementsData={[]}
                // Enable polygon layer
                polygonsData={countries}
                polygonCapColor={(feat: object) => {
                  const visited = isCountryVisited(feat);
                  return visited ? "#f43f5e" : "transparent";
                }}
                polygonSideColor={(feat: object) => (isCountryVisited(feat) ? "#e879f9" : "transparent")}
                polygonStrokeColor={(feat: object) => (isCountryVisited(feat) ? "#9f1239" : "transparent")}
                polygonAltitude={(feat: object) => (isCountryVisited(feat) ? 0.01 : 0)}
                polygonsTransitionDuration={300}
                autoRotate={true}
                autoRotateSpeed={1.0}
                enableZoom={false}
                enablePan={false}
                enableRotate={true}
              />
            </div>
          </div>
          <div>
            <H2 className="text-left mb-2">Bucketlist</H2>
            <Body2 className="max-w-xl mb-4">Things I did or aim to do in the future.</Body2>
            <div className="flex md:flex-row flex-col-reverse items-start gap-8 md:gap-16">
              <ul className="space-y-3">
                {BUCKETLIST.filter((item) => item.completed).map((item) => (
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
                {BUCKETLIST.filter((item) => !item.completed).map((item) => (
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
          </div>
        </section>
        <section className="w-full p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg overflow-hidden">
          <H2 className="text-left mb-6">Apps in use</H2>
          <div className="rounded-[62px] aspect-[178/400] w-full relative mx-auto max-w-[350px] h-80">
            <div className="absolute bg-[url('/images/empty-iphone-mockup-light.png')] dark:bg-[url('/images/empty-iphone-mockup-dark.png')] aspect-[178/400] w-full inset-0 bg-contain left-1/2 select-none -translate-x-1/2 top-0" />
            <div className="absolute inset-0 px-6 md:px-4 py-16 max-w-[200px] mx-auto">
              <div className="grid grid-cols-4 gap-2">
                {TOOLS.map((tool) => (
                  <Link href={tool.link} target="_blank" className="cursor-default">
                    <div className="rounded-xl relative group">
                      <img
                        src={tool.icon}
                        alt={tool.name}
                        className="object-cover rounded-[10px] cursor-pointer border border-neutral-200 dark:border-neutral-900 mb-0.5"
                      />
                      <div className="group-hover:opacity-10 group-active:opacity-20 pointer-events-none transition-all bg-black opacity-0 rounded-xl inset-0 absolute" />
                    </div>
                    <Body4 className="text-center cursor-text truncate text-[9px]">{tool.name}</Body4>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
