import Animation from "@/components/shared/animation";

export default function Page() {
  const life = [
    {
      title: "Brick by brick",
      description:
        "As my favorite toy as a child, LEGO bricks helped me to develop a passion for building creative things.",
      animation: {
        src: "/animations/florian.riv",
        artboard: "lego-stack",
        animations: ["play"],
        autoplay: true,
      },
    },
    {
      title: "Youtube",
      description:
        "When I grew up, I began to work with different Youtube channels worldwide via. the platform Fiverr.",
      animation: {
        src: "/animations/florian.riv",
        artboard: "youtube",
        animations: ["play"],
        autoplay: true,
      },
    },
    {
      title: "Bauhaus",
      description:
        "I always selected educational courses after the Bauhaus movement as this way of thinking is consistent with my design philosophy.",
      animation: {
        src: "/animations/florian.riv",
        artboard: "bauhaus",
        animations: ["play"],
        autoplay: true,
      },
    },
  ];

  const companies = [
    {
      name: "Google",
      logo: "/images/companies/google.svg",
    },
  ];

  return (
    <div className="w-full px-4">
      <div className="w-full max-w-5xl mx-auto">
        <section className="flex flex-col items-start gap-4 mb-8">
          <div className="pb-8 w-full relative mb-4">
            <div className="-mb-8 ml-1.5 border border-neutral-200 rounded-full w-28 aspect-square overflow-hidden">
              <img
                src="/images/avatars/florian_kiem.webp"
                className="w-full rounded-full transition-all duration-300 ease-out hover:dither"
              />
            </div>
            <div className="absolute pointer-events-none -bottom-11 h-full w-32">
              <svg viewBox="0 0 100 50" width="100%" height="100">
                <path id="titleCurve" d="M0,35 C20,64 80,60 100,35" fill="transparent" />
                <text className="fill-neutral-800 text-lg font-semibold pointer-events-auto">
                  <textPath role="h1" xlinkHref="#titleCurve" startOffset="28%" textAnchor="middle" className="text-sm">
                    About Flo
                  </textPath>
                </text>
              </svg>
              <h1 className="text-lg font-semibold w-64 absolute bottom-[15.5px] left-[72px] pointer-events-auto">
                rian: <span className="text-neutral-400">An Introduction</span>
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-2 max-w-xl shrink-0 items-start">
            <p className="text-sm">
              Many designers are writing about similar desires. So I just write my current thinking about the state of
              design and engineering down, and what benefits and joy it brings to me.
            </p>
            <p className="text-sm mb-4">
              As a design engineer, my biggest strength is to translate design into code. Working in the intersection of
              those two worlds truly feels special. It doesn't only make companies more efficient by making iteration
              cycles smaller, but also helps the handoff between both teams to heal long-term, eventually resulting in
              better products and faster shipping.
            </p>
          </div>
        </section>
        <section className="w-full mb-16">
          <h2 className="font-semibold text-left mb-6">Life TLDR;</h2>
          <div className="w-full grid md:grid-cols-3 md:gap-8 lg:gap-12">
            {life.map((step) => (
              <div className="flex flex-col gap-2 mb-12 max-w-sm">
                <Animation riveParams={step.animation} className="w-32 h-32 bg-neutral-50 rounded-md mb-2" />
                <h3 className="font-semibold text-sm text-left">{step.title}</h3>
                <p className="text-sm text-balance"> {step.description}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="w-full">
          <h2 className="font-semibold text-left mb-6">Companies worked with</h2>
          <div className="w-full flex flex-wrap gap-4">
            {companies.map((company) => (
              <img src={company.logo} alt={company.name} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
