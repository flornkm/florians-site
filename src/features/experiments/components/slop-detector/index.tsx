import { useEffect, useRef, useState } from "react";
import { HighlightOverlay } from "./HighlightOverlay";
import { ContainerContext } from "./lib/container";
import { Scene } from "./Scene";

const SAMPLE_POSTS: { handle: string; body: string }[] = [
  {
    handle: "@alex",
    body: "ran into an old colleague today at the coffee shop. we ended up talking for two hours about the last decade. funny how some people just pick up where they left off.",
  },
  {
    handle: "@jordan_speaks",
    body: "In today's fast-paced world, it's not just about working harder — it's about working smarter. Every day, we navigate a complex tapestry of opportunities. It's a testament to our resilience that we continue to delve into uncharted territory and unlock our true potential. The future is bright. Thoughts?",
  },
  {
    handle: "@sam",
    body: "the dishwasher broke again. third time this year. i think we're just going to wash by hand from now on, honestly it's faster than waiting for the repair guy to show up.",
  },
  {
    handle: "@founder_arc",
    body: "🚀 In today's hyperconnected world, we're entering a transformative era. It's not just about disruption — it's about reimagining the paradigm. We don't just navigate the landscape, we orchestrate the symphony. We don't just leverage AI, we harness its boundless potential. ✨ At the end of the day, the smartest person in the room is the one who delves deep, embraces the journey, and unlocks unparalleled value. Indeed, this is a watershed moment. Furthermore, those who fail to pivot will be left behind. Moreover, the future is bright. Ultimately, we are the architects of tomorrow's cornerstone. 🔥 #leadership #innovation #disruption Thoughts? Drop a comment.",
  },
  {
    handle: "@mira",
    body: "yesterday i finally fixed the leaky tap. turns out the washer was just worn out. cost me about three quid at the hardware shop. small wins.",
  },
];

export function SlopDetector() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(containerRef.current);
  }, []);

  return (
    <ContainerContext.Provider value={container}>
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-primary text-primary select-none"
      >
        <div className="relative z-[1] h-full w-full overflow-y-auto">
          <div className="max-w-[440px] pl-8 md:pl-14 pr-8 md:pr-40 py-14 md:py-20">
            <div className="flex flex-col gap-12">
              {SAMPLE_POSTS.map((p) => (
                <article key={p.handle} className="flex flex-col gap-3">
                  <span className="text-[12px] text-quaternary">{p.handle}</span>
                  <p className="text-[15px] leading-[1.65] text-secondary">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-[10] pointer-events-none">
          <Scene />
        </div>
        <HighlightOverlay />
      </div>
    </ContainerContext.Provider>
  );
}
