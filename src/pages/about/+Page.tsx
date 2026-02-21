import { Body1 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import { Link } from "@/components/ui/link";
import { RichTooltip } from "@/components/ui/tooltip";
import { AppsTooltipContent } from "./components/apps-tooltip-content";
import { BucketlistTooltipContent } from "./components/bucketlist-tooltip-content";
import { CompaniesTooltipContent } from "./components/companies-tooltip-content";
import { GlobeTooltipContent } from "./components/globe-tooltip-content";
import { InstitutionsTooltipContent } from "./components/institutions-tooltip-content";
import { VISITED_COUNTRIES } from "./const/visited-countries";

export default function Page() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="w-full max-w-sm px-4 md:px-0">
        <H1 className="mb-6 leading-tight ">Florian Kiem</H1>

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
    </div>
  );
}
