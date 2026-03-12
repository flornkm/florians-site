import { Body1 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import { Link } from "@/components/ui/link";
import { RichTooltip } from "@/components/ui/tooltip";
import { AppsTooltipContent } from "@/features/about/components/apps-tooltip-content";
import { BucketlistTooltipContent } from "@/features/about/components/bucketlist-tooltip-content";
import { CompaniesTooltipContent } from "@/features/about/components/companies-tooltip-content";
import { FloWording } from "@/features/about/components/flo-wording";
import { GlobeTooltipContent } from "@/features/about/components/globe-tooltip-content";
import { InstitutionsTooltipContent } from "@/features/about/components/institutions-tooltip-content";
import { VISITED_COUNTRIES } from "@/features/about/const/visited-countries";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About • Florian - Design Engineer" },
      {
        name: "description",
        content: "How I got to design and coding, what I learned and accomplished so far, and why I love doing what I do.",
      },
      { property: "og:image", content: "/api/og?title=About" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="w-full max-w-5xl md:flex-row flex-col flex justify-between mx-auto">
      <div className="w-full max-w-sm px-4 md:px-0">
        {/* Preloading the globe */}
        <div className="hidden" aria-hidden>
          <GlobeTooltipContent />
        </div>
        <div className="flex items-start gap-8 mb-6">
          <H1 className="shrink-0 leading-tight">Florian Kiem</H1>
        </div>

        <div className="space-y-4">
          <Body1 className="leading-relaxed">
            I was born in southern Germany on <code>110101(DDMMYY)</code>. During my childhood I played a lot of
            Minecraft, sold services on Fiverr, and somehow found my way into product design.
          </Body1>

          <Body1 className="leading-relaxed">
            I studied product design and development in{" "}
            <RichTooltip content={<InstitutionsTooltipContent />} maxWidth={280}>
              university
            </RichTooltip>
            , the University of Design in Schwaebisch Gmuend, Germany, and the TU Delft in Delft, the Netherlands. Since
            then, my biggest strength is to work as an interpreter from design to code.
          </Body1>

          <Body1 className="leading-relaxed">
            I've been fortunate to work with a lot of{" "}
            <RichTooltip content={<CompaniesTooltipContent />} maxWidth={340}>
              talented teams
            </RichTooltip>{" "}
            in the past.
          </Body1>

          <Body1 className="leading-relaxed">
            Outside of work, I keep a{" "}
            <RichTooltip content={<BucketlistTooltipContent />} maxWidth={260}>
              bucketlist
            </RichTooltip>{" "}
            that I check off, I've travelled to{" "}
            <RichTooltip content={<GlobeTooltipContent />} maxWidth={320}>
              {VISITED_COUNTRIES.length} countries
            </RichTooltip>{" "}
            so far, and I spend time using my set of{" "}
            <RichTooltip content={<AppsTooltipContent />} maxWidth={280}>
              everyday apps
            </RichTooltip>
            .
          </Body1>

          <Body1 className="leading-relaxed text-tertiary">
            You can reach me at{" "}
            <Link
              href="https://x.com/flornkm"
              target="_blank"
              className="hover:text-primary underline decoration-muted underline-offset-2 hover:decoration-emphasis transition-colors"
            >
              @flornkm
            </Link>{" "}
            or{" "}
            <Link
              href="mailto:hello@floriankiem.com"
              className="hover:text-primary underline decoration-muted underline-offset-2 hover:decoration-emphasis transition-colors"
            >
              hello@floriankiem.com
            </Link>
            .
          </Body1>
        </div>
      </div>
      <div className="flex-1 min-h-40 flex items-center justify-center pt-2">
        <FloWording />
      </div>
    </div>
  );
}
