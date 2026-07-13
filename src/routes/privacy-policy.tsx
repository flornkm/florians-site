import { Body1 } from "@/components/design-system/body";
import { H2 } from "@/components/design-system/heading";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy ‹ Florian Design Engineer" },
      { name: "description", content: "The usual privacy policy page." },
      { property: "og:title", content: "Privacy Policy" },
      { property: "og:description", content: "The usual privacy policy page." },
      { property: "og:image", content: "/api/og?title=Privacy Policy" },
      { name: "twitter:title", content: "Privacy Policy" },
      { name: "twitter:description", content: "The usual privacy policy page." },
      { name: "twitter:image", content: "/api/og?title=Privacy Policy" },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="grid grid-cols-9 gap-x-6">
      <section className="col-start-1 col-span-9 md:col-start-3 md:col-span-3 lg:col-span-2">
        <H2 className="mb-4">Privacy Policy</H2>
        <Body1>
          This is a personal site and contains links to other websites (just as any other website).
          <br />
          It doesn't specifically track any personal data.
          <br />
          <br />
          Privacy requests won't be answered as this site doesn't earn revenue.
        </Body1>
      </section>
    </div>
  );
}
