import { H1 } from "@/components/design-system/heading";
import { Link } from "@/components/ui/link";
import { CONTACTS } from "@/const/contacts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact • Florian - Design Engineer" },
      {
        name: "description",
        content: "Get in touch with Florian — email, socials, and more.",
      },
      { property: "og:image", content: "/api/og?title=Contact" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="w-full max-w-5xl mx-auto md:px-0 px-4">
      <H1 className="mb-8">Contact</H1>
      <div className="flex flex-col gap-3">
        {CONTACTS.filter((c) => c.name !== "iMessage").map((contact) => (
          <Link
            key={contact.name}
            href={contact.href}
            target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
            className="flex items-center justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-interactive-hover transition-colors group"
          >
            <span className="text-secondary group-hover:text-primary transition-colors">
              {contact.name}
            </span>
            <span className="text-tertiary text-sm">{contact.handle}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
