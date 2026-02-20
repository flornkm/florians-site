import { H1, H2 } from "@/components/design-system/heading";
import { TextShimmerDemo } from "@/components/experiments/text-shimmer-demo";

const EXPERIMENTS = [{ title: "Text Shimmer", Component: TextShimmerDemo }];

export default function Page() {
  return (
    <div className="w-full max-w-5xl mx-auto md:px-0 px-4 space-y-12">
      <H1 className="mb-8">Experiments</H1>
      {EXPERIMENTS.map(({ title, Component }) => (
        <section className="w-full flex flex-col gap-2" key={title}>
          <H2>{title}</H2>
          <div className="rounded-xl bg-primary border border-primary aspect-[4/3] flex items-center justify-center">
            <Component />
          </div>
        </section>
      ))}
    </div>
  );
}
