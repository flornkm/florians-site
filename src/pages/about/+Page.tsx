import { Body2, Body3 } from "@/components/design-system/body";
import { H1, H2, H3 } from "@/components/design-system/heading";
import { IconAspectRatio11 } from "central-icons/IconAspectRatio11";
import { IconCheckmark2Small } from "central-icons/IconCheckmark2Small";
import { useRef } from "react";
import type { GlobeMethods } from "react-globe.gl";

import countriesData from "@/assets/data/countries.json";

import { SmartVideo } from "@/components/shared/smart-video";
import { Globe } from "@/components/ui/globe";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { Link } from "@/components/ui/link";
import { LogoHover } from "@/components/ui/logo-hover";
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
        <section className="w-full md:grid grid-cols-[412px_1fr] gap-4 mb-12">
          {/* Left Column: Avatar + Headline + Interview Link */}
          <div className="flex flex-col items-start w-full">
            <div className="pb-8 w-full relative mb-8">
              <div className="-mb-8 ml-1.5 border border-primary rounded-full w-28 aspect-square overflow-hidden">
                <img
                  src="/images/avatars/florian_kiem.webp"
                  className="w-full rounded-full transition-all duration-300 ease-out"
                />
              </div>
              <div className="absolute pointer-events-none -bottom-11 h-full w-32 overflow-visible">
                <svg viewBox="0 0 100 50" width="100%" height="100" overflow="visible" style={{ overflow: "visible" }}>
                  <path id="titleCurve" d="M0,35 C20,64 80,60 100,35" fill="transparent" />
                  <text className="fill-primary text-lg font-semibold pointer-events-auto">
                    <textPath
                      role="h1"
                      xlinkHref="#titleCurve"
                      startOffset="28%"
                      textAnchor="middle"
                      className="text-sm"
                    >
                      About Flo
                    </textPath>
                  </text>
                </svg>
                <H1 className="text-[19px] w-64 absolute bottom-[16px] left-[75px] pointer-events-auto">
                  rian: <span className="text-quaternary">An Introduction</span>
                </H1>
              </div>
            </div>
          </div>
          {/* Right Column: About Text */}
          <div className="flex flex-col gap-2 shrink-0 items-start">
            <Body2 className="mb-2 text-balance text-tertiary">
              Many designers are writing about similar desires. So I just write my current thinking about the state of
              design and engineering down, and what benefits and joy it brings to me.
            </Body2>
            <Body2 className="text-balance text-tertiary">
              As a design engineer, my biggest strength is to translate design into code. Working in the intersection of
              those two worlds truly feels special. It doesn't only make companies more efficient by making iteration
              cycles smaller, but also helps the handoff between both teams to heal long-term, eventually resulting in
              better products.
            </Body2>
          </div>
        </section>
        <section className="w-full mb-16">
          <div className="w-full grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {LIFE.map((step, index) => (
              <div key={index} className="flex flex-col gap-2 max-w-sm">
                <div className="size-20 aspect-square flex items-center justify-center rounded-lg">
                  {step.video && (
                    <SmartVideo
                      className="object-contain bg-transparent"
                      style={{ width: step.video.size, height: step.video.size }}
                      webm={step.video.webm}
                      mp4={step.video.mp4}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="metadata"
                    />
                  )}
                </div>
                <H3 className="text-left">{step.title}</H3>
                <Body2 className="text-tertiary">{step.description}</Body2>
              </div>
            ))}
          </div>
        </section>
        <section className="w-full flex flex-col justify-center">
          <H2 className="text-left mb-2">Past</H2>
          <Body2 className="max-w-xl mb-4 text-tertiary">
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
                  width: company.width,
                }}
              />
            ))}
          </HorizontalScroll>
          <Body2 className="max-w-xl mb-4 text-tertiary">
            A lot of the things I learned comes from practice which I was able to apply to my own projects at these
            universities:
          </Body2>
          <HorizontalScroll>
            {INSTITUTIONS.map((institution) => (
              <LogoHover
                entity={{
                  url: institution.url,
                  name: institution.name,
                  logo: institution.logo,
                  width: institution.width,
                }}
              />
            ))}
          </HorizontalScroll>
        </section>
        <section className="grid md:grid-cols-2 gap-4">
          {/* Apps in Use - Bento Card */}
          <div className="p-4 pb-0 bg-surface-secondary rounded-lg overflow-hidden">
            <H2 className="text-left mb-4">Apps in use</H2>
            <div className="rounded-[62px] aspect-[178/400] w-full relative mx-auto max-w-[320px] h-80">
              <div className="absolute bg-[url('/images/empty-iphone-mockup-light.png')] dark:bg-[url('/images/empty-iphone-mockup-dark.png')] aspect-[178/400] w-full inset-0 bg-contain left-1/2 select-none -translate-x-1/2 top-0" />
              <div className="absolute inset-0 px-4 py-16 max-w-[188px] mx-auto">
                <div className="grid grid-cols-4 gap-1.5">
                  {TOOLS.map((tool) => (
                    <Link key={tool.name} href={tool.link} target="_blank" className="cursor-default">
                      <div className="rounded-xl relative group">
                        <img
                          src={tool.icon}
                          alt={tool.name}
                          className="object-cover rounded-[8px] cursor-pointer border border-primary"
                        />
                        <div className="group-hover:opacity-10 group-active:opacity-20 pointer-events-none transition-all bg-inverted opacity-0 rounded-xl inset-0 absolute" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Bucketlist - Bento Card */}
          <div className="p-4 bg-surface-secondary rounded-lg">
            <H2 className="text-left mb-2">Bucketlist</H2>
            <div className="flex flex-col gap-6">
              <ul className="space-y-2">
                {BUCKETLIST.filter((item) => !item.completed).map((item) => (
                  <li key={item.title} className="flex items-start gap-1.5">
                    <IconAspectRatio11 className="shrink-0 size-5 mt-px" />
                    <Body2 className="font-medium text-primary">{item.title}</Body2>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2">
                {BUCKETLIST.filter((item) => item.completed).map((item) => (
                  <li key={item.title} className="flex items-start gap-1.5 text-quaternary">
                    <IconCheckmark2Small className="shrink-0 size-5 mt-px" />
                    <Body2 className="font-medium">{item.title}</Body2>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        {/* Countries Visited - Full Width with Larger Globe */}
        <section className="w-full p-6 bg-surface-secondary rounded-lg -mt-12">
          <div className="flex flex-col items-center">
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <H2 className="text-left mb-2 md:mb-0">Countries visited</H2>
              <div className="flex items-center gap-2">
                <div className="bg-rose-500 rounded-sm size-3" />
                <Body3 className="font-medium text-primary">{VISITED_COUNTRIES.length} visited</Body3>
              </div>
            </div>
            <div className="mask-radial-[50%_55%] overflow-hidden mask-radial-from-50% w-full flex items-center justify-center">
              <Globe
                ref={globeRef}
                width={340}
                height={340}
                globeImageUrl="/images/earth-texture.jpg"
                showAtmosphere={false}
                globeCurvatureResolution={8}
                animateIn={true}
                htmlElementsData={[]}
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
        </section>
      </div>
    </div>
  );
}
