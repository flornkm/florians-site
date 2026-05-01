import { H1, H2 } from "@/components/design-system/heading";
import { CrtChat } from "@/features/experiments/components/crt-chat-demo";
import { DepthInput } from "@/features/experiments/components/depth-input";
import { FontSmoothing } from "@/features/experiments/components/font-smoothing-demo";
import { IosContextMenu } from "@/features/experiments/components/ios-context-menu-demo";
import { LazyImage } from "@/features/experiments/components/lazy-image-demo";
import { PaperRoll } from "@/features/experiments/components/paper-roll-demo";
import { ScrollMaskFade } from "@/features/experiments/components/scroll-mask-fade-demo";
import { TextShimmerExperiment } from "@/features/experiments/components/text-shimmer-demo";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

const EXPERIMENTS = [
  { title: "Scroll Mask Fade", Component: ScrollMaskFade, aspect: "aspect-[4/5] md:aspect-[4/3]" },
  { title: "Font Smoothing", Component: FontSmoothing },
  { title: "Lazy Image", Component: LazyImage, aspect: "aspect-[4/5] md:aspect-[4/3]" },
  { title: "Depth Input", Component: DepthInput },
  { title: "CRT Terminal", Component: CrtChat },
  { title: "iOS Context Menu", Component: IosContextMenu },
  { title: "Receipt", Component: PaperRoll, aspect: "aspect-[9/16] md:aspect-[4/3]" },
  { title: "Text Shimmer", Component: TextShimmerExperiment },
];

export const Route = createFileRoute("/experiments")({
  head: () => ({
    meta: [
      { title: "Experiments • Florian - Design Engineer" },
      {
        name: "description",
        content: "A page collecting different design engineering experiments.",
      },
      { property: "og:image", content: "/api/og?title=Experiments" },
    ],
  }),
  component: ExperimentsPage,
});

function ExperimentsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto md:px-0 px-4 space-y-12">
      <H1 className="mb-8">Experiments</H1>
      {EXPERIMENTS.map(({ title, Component, aspect }) => (
        <section className="w-full flex flex-col gap-2" key={title}>
          <H2>{title}</H2>
          <div
            className={cn(
              "relative rounded-xl bg-transparent border border-primary flex items-center justify-center overflow-hidden isolate has-[[data-menu-open]]:overflow-visible has-[[data-menu-open]]:z-[100]",
              aspect || "aspect-[4/3]",
            )}
          >
            <Component />
          </div>
        </section>
      ))}
    </div>
  );
}
