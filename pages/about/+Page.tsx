import { useRef } from "react";
import { RiveResponsive } from "../../components/shared/RiveResponsive";

export default function Page() {
  const timelineRef = useRef<HTMLElement>(null);

  return (
    <div className="w-full px-4">
      <div className="w-full max-w-5xl mx-auto">
        <section className="flex flex-col items-start gap-4 mb-8">
          <div className="pb-8 w-full">
            <img
              src="/images/avatars/florian_kiem.webp"
              className="w-16 -mb-8 rounded-full border border-neutral-200 outline-4 outline-white"
            />
          </div>
          <div className="flex flex-col gap-2 max-w-xl shrink-0 items-start">
            <h2 className="font-semibold text-lg">About Florian</h2>
            <p className="text-sm">
              Many designers are writing about similar desires. So I just write my current thinking about the state of
              design and engineering down, and what benefits and joy it brings to me.
            </p>
            <p className="text-sm mb-4">
              As a design engineer, my biggest strength is to translate design into code. Working in the intersection of
              those two worlds truly feels special. It doesn't only make companies more efficient by making iteration
              cycles smaller, but also helps the handoff between both teams to heal long-term, eventually resulting in
              better products.
            </p>
          </div>
        </section>
        <section
          ref={timelineRef}
          className="w-full lg:pb-8 bg-neutral-50 relative rounded-md lg:max-w-none max-w-xl flex flex-col p-6 overflow-hidden mb-24"
        >
          <h2 className="font-semibold text-left mb-6">
            Life <span className="text-neutral-400">Simplified</span>
          </h2>
          <RiveResponsive
            src="/animations/florian.riv"
            artboardDesktop="timeline"
            artboardMobile="timeline-mobile"
            observeScroll={false}
            autoplay={true}
            className="h-96 lg:h-32"
          />
        </section>
      </div>
    </div>
  );
}
