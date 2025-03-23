import { useRive } from "@rive-app/react-canvas";

export default function Page() {
  const { RiveComponent } = useRive({
    src: "/animations/florian.riv",
    autoplay: true,
    artboard: "signature",
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <section className="flex flex-col items-start gap-4 mb-4 max-w-xl">
        <div className="relative w-64 h-32 mb-5.5">
          <video
            src="/videos/florian_easter_egg.mp4"
            muted
            className="w-32 ml-0.5 apsect-square rounded-full border border-neutral-200"
          />
          <div className="absolute -bottom-15 h-full w-32">
            <svg viewBox="0 0 100 50" width="100%" height="100">
              <path id="titleCurve" d="M0,35 C20,64 80,60 100,35" fill="transparent" />
              <text className="fill-neutral-800 text-lg font-semibold">
                <textPath role="h1" xlinkHref="#titleCurve" startOffset="28%" textAnchor="middle" className="text-sm">
                  About Flo
                </textPath>
              </text>
            </svg>
            <h1 className="text-lg font-semibold w-64 absolute bottom-[31.25px] left-[72px]">rian Kiem</h1>
          </div>
        </div>
        <div className="flex flex-col gap-2 max-w-xl shrink-0 items-start">
          <p className="text-sm">
            Many designers are writing about similar desires. So I just write my current thinking about the state of
            design and engineering down.
          </p>
          <p className="text-sm mb-8">
            As a design engineer, my biggest strength is to translate design into code. Working in the intersection of
            those two worlds truly makes me happy, in every sense. It doesn't only make a company more efficient by
            making iteration cycles smaller, but also helps the handoff between both teams to heal long-term.
          </p>
        </div>
        <RiveComponent className="w-24 h-16" />
      </section>
    </div>
  );
}
