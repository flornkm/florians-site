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
    handle: "@founder_arc",
    body: "🚀 In today's hyperconnected world, we're entering a transformative era. It's not just about disruption — it's about reimagining the paradigm. We don't just navigate the landscape, we orchestrate the symphony. We don't just leverage AI, we harness its boundless potential. ✨ Indeed, this is a watershed moment. Ultimately, we are the architects of tomorrow's cornerstone. 🔥",
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
        style={{ touchAction: "none" }}
      >
        <div className="relative z-[1] h-full w-full pl-6 md:pl-12 pr-6 md:pr-44 py-6 md:py-10 flex flex-col justify-center gap-6 max-w-[55%]">
          {SAMPLE_POSTS.map((p) => (
            <article key={p.handle} className="flex flex-col gap-1.5">
              <span className="text-[10px] text-quaternary">{p.handle}</span>
              <p className="text-[13px] leading-snug text-secondary">{p.body}</p>
            </article>
          ))}
        </div>

        <div className="absolute inset-0 z-[10] pointer-events-none">
          <Scene />
        </div>
        <HighlightOverlay />
      </div>
    </ContainerContext.Provider>
  );
}
