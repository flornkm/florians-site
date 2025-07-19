import ArrowTopRight from "@/components/icons/arrow-top-right";
import { Link } from "@/components/shared/link";

export default function Page() {
  const life = [
    {
      title: "Brick by brick",
      description:
        "As my favorite toy as a child, LEGO bricks helped me to develop a passion for building creative things.",
      video: {
        src: "/videos/rotating-block.webm",
        size: 80,
      },
    },
    {
      title: "Internet",
      description:
        'I\'m a "typical" internet kid. Growing up, I worked with different Youtube channels, editing videos for them, and learning a lot.',
      video: {
        src: "/videos/rotating-laptop.webm",
        size: 96,
      },
    },
    {
      title: "Bauhaus",
      description: "I was always fascinated by the Bauhaus movement and its focus on simplicity and functionality.",
      video: {
        src: "/videos/rotating-vitra-chair.webm",
        size: 128,
      },
    },
  ];

  const companies = [
    {
      name: "Superpower",
      logo: "/images/companies/superpower-logo.svg",
      url: "https://superpower.com",
    },
    {
      name: "Opral",
      logo: "/images/companies/opral-logo.svg",
      url: "https://opral.com",
    },
    {
      name: "3D AI Studio",
      logo: "/images/companies/3d-ai-studio-logo.svg",
      url: "https://3daistudio.com",
    },
    {
      name: "Morphic",
      logo: "/images/companies/morphic-logo.svg",
      url: "https://morphic.com",
    },
    {
      name: "Novis",
      logo: "/images/companies/novis-logo.svg",
      url: "https://novis.ai",
    },
    {
      name: "Remove.tech",
      logo: "/images/companies/remove-tech-logo.svg",
      url: "https://remove.tech",
    },
  ];

  const institutions = [
    {
      name: "TU Delft",
      logo: "/images/institutions/tudelft-logo.svg",
      url: "https://tudelft.nl",
    },
    {
      name: "University of Design Schwaebisch Gmuend",
      logo: "/images/institutions/hfg-logo.svg",
      url: "https://hfg-gmuend.de",
    },
  ];

  return (
    <div className="w-full">
      <div className="w-full max-w-5xl mx-auto px-4">
        <section className="flex flex-col items-start gap-4 mb-8">
          <div className="pb-8 w-full relative mb-4">
            <div className="-mb-8 ml-1.5 border border-neutral-200 rounded-full w-28 aspect-square overflow-hidden">
              <img
                src="/images/avatars/florian_kiem.webp"
                className="w-full rounded-full transition-all duration-300 ease-out"
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
            <p className="text-sm text-neutral-500">
              Many designers are writing about similar desires. So I just write my current thinking about the state of
              design and engineering down, and what benefits and joy it brings to me.
            </p>
            <p className="text-sm mb-4 text-neutral-500">
              As a design engineer, my biggest strength is to translate design into code. Working in the intersection of
              those two worlds truly feels special. It doesn't only make companies more efficient by making iteration
              cycles smaller, but also helps the handoff between both teams to heal long-term, eventually resulting in
              better products and faster shipping.
            </p>
          </div>
        </section>
        <section className="w-full mb-16">
          <h2 className="font-semibold text-left mb-4">Info</h2>
          <div className="w-full grid md:grid-cols-3 md:gap-8 lg:gap-12">
            {life.map((step, index) => (
              <div key={index} className="flex flex-col gap-2 max-w-sm">
                <div className="rounded-md aspect-square w-32 flex items-center justify-center mb-2 bg-neutral-100">
                  {step.video && (
                    <video
                      src={step.video.src}
                      className="object-contain"
                      style={{
                        width: step.video.size,
                        height: step.video.size,
                      }}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="metadata"
                    />
                  )}
                </div>
                <h3 className="font-semibold text-sm text-left">{step.title}</h3>
                <p className="text-sm text-neutral-500"> {step.description}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="w-full flex flex-col justify-center">
          <h2 className="font-semibold text-left mb-2">Past</h2>
          <p className="text-sm text-neutral-500 max-w-xl mb-4">
            I'm very thankful for the opportunities I had in the past to work together with some of the most talented
            teams, learning from them and working on truly great products:
          </p>
          <div className="w-auto flex mb-8 gap-8 scrollbar-none px-8 md:px-0 py-4 items-center md:mask-r-from-50% max-md:mask-x-from-95% scrollbar overflow-x-auto">
            {companies.map((company) => (
              <LogoHover
                entity={{
                  url: company.url,
                  name: company.name,
                  logo: company.logo,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-neutral-500 max-w-xl mb-4">
            A lot of the things I learned comes from practice which I was able to apply to my own projects at these
            institutions:
          </p>
          <div className="w-auto flex gap-8 scrollbar-none px-8 md:px-0 py-4 items-center md:mask-r-from-50% max-md:mask-x-from-95% scrollbar overflow-x-auto">
            {institutions.map((institution) => (
              <LogoHover
                entity={{
                  url: institution.url,
                  name: institution.name,
                  logo: institution.logo,
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const LogoHover = ({
  entity,
}: {
  entity: {
    url: string;
    name: string;
    logo: string;
  };
}) => {
  return (
    <div className="group w-24 shrink-0 relative">
      <Link
        className="absolute line-clamp-1 z-10 cursor-pointer inset-0 text-center text-neutral-500 opacity-0 group-hover:opacity-100 blur-[2px] transition-all group-hover:blur-none"
        href={entity.url}
        target="_blank"
      >
        {entity.name}
        <ArrowTopRight className="w-4 h-4 inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 ease-out" />
      </Link>
      <img
        src={entity.logo}
        alt={entity.name}
        className="h-6 opacity-50 mx-auto group-hover:blur-[2px] group-hover:opacity-10 transition-all"
      />
    </div>
  );
};
