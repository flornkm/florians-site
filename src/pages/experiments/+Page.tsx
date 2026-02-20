import { H1, H2 } from "@/components/design-system/heading";
import { TextShimmerDemo } from "@/components/experiments/text-shimmer-demo";

const EXPERIMENTS = [{ title: "Text Shimmer", Component: TextShimmerDemo }];

export default function Page() {
  return (
    <div className="w-full max-w-5xl mx-auto md:px-0 px-4 space-y-12">
      <H1 className="mb-8">Experiments</H1>
      {EXPERIMENTS.map(({ title, Component }) => (
        <section className="h-[400px] w-full flex flex-col gap-2" key={title}>
          <H2>{title}</H2>
          <div className="border border-primary rounded flex-1 flex flex-col gap-2 items-center justify-center relative overflow-hidden">
            <Component />
          </div>
        </section>
      ))}
    </div>
  );
}
