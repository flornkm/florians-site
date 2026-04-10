import { H1, H2 } from "@/components/design-system/heading";
import { CrtChatDemo } from "@/features/experiments/components/crt-chat-demo";
import { IosContextMenuDemo } from "@/features/experiments/components/ios-context-menu-demo";
import { PaperRollDemo } from "@/features/experiments/components/paper-roll-demo";
import { TextShimmerDemo } from "@/features/experiments/components/text-shimmer-demo";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

const EXPERIMENTS = [
  { title: "CRT Terminal", Component: CrtChatDemo },
  { title: "iOS Context Menu", Component: IosContextMenuDemo },
  { title: "Receipt", Component: PaperRollDemo, aspect: "aspect-[9/16] md:aspect-[4/3]" },
  { title: "Text Shimmer", Component: TextShimmerDemo },
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
          <div className={cn("rounded-xl bg-primary border border-primary flex items-center justify-center", aspect || "aspect-[4/3]")}>
            <Component />
          </div>
        </section>
      ))}
    </div>
  );
}
