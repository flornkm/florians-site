import { Body1 } from "@/components/design-system/body";
import { H2 } from "@/components/design-system/heading";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/imprint")({
  head: () => ({
    meta: [
      { title: "Imprint ‹ Florian Design Engineer" },
      { name: "description", content: "The usual imprint page." },
      { property: "og:title", content: "Imprint" },
      { property: "og:description", content: "The usual imprint page." },
      { property: "og:image", content: "/api/og?title=Imprint" },
      { name: "twitter:title", content: "Imprint" },
      { name: "twitter:description", content: "The usual imprint page." },
      { name: "twitter:image", content: "/api/og?title=Imprint" },
    ],
  }),
  component: ImprintPage,
});

function ImprintPage() {
  return (
    <div className="grid grid-cols-9 gap-x-6">
      <section className="col-start-1 col-span-9 md:col-start-3 md:col-span-5">
        <H2 className="mb-4">Imprint</H2>
        <Body1>
          Florian Kiem <br />
          IFZA Business Park, DDP <br />
          63615 - 001, Dubai <br />
          UAE <br />
        </Body1>
      </section>
    </div>
  );
}
