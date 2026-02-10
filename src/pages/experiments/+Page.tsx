import { H1, H2 } from "@/components/design-system/heading";
import { ButtonAlignment } from "./components/button-alignment";
import { CssCalculations } from "./components/css-calculations";
import { GrabInteraction } from "./components/grab-interaction";

const EXPERIMENTS = [
  { title: "Grab interactions", Component: GrabInteraction },
  { title: "CSS Calculations", Component: CssCalculations },
  { title: "Optical alignment", Component: ButtonAlignment },
];

export default function Page() {
  return (
    <div className="w-full max-w-5xl mx-auto md:px-0 px-4 space-y-12">
      <H1 className="mb-8">Experiments</H1>
      {EXPERIMENTS.map(({ title, Component }) => (
        <section className="h-[700px] w-full flex flex-col gap-2" key={title}>
          <H2>{title}</H2>
          <div className="border border-neutral-200 dark:border-neutral-900 rounded flex-1 flex flex-col gap-2 items-center justify-center relative">
            <Component />
          </div>
        </section>
      ))}
    </div>
  );
}
