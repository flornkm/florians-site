import { CONTACTS } from "@/const/contacts";
import { SITE_URL } from "@/lib/site";

const SOCIAL_PROFILES = CONTACTS.map((c) => c.href).filter((href) => href.startsWith("https://"));

// schema.org identity for the site: a Person (this is a personal site) plus the
// WebSite that belongs to him, linked via @id so agents resolve both as one entity.
export const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Florian Kiem",
      url: SITE_URL,
      email: "mailto:hello@floriankiem.com",
      jobTitle: "Design Engineer",
      description:
        "Florian Kiem is a design engineer who designs and codes software products, working in the intersection of design and engineering.",
      sameAs: SOCIAL_PROFILES,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Florian Kiem",
      url: SITE_URL,
      description:
        "The personal site of Florian Kiem - design and code, bridging the gap between creativity and logic in this portfolio.",
      author: { "@id": `${SITE_URL}/#person` },
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
} as const;

export const structuredDataJson = () => JSON.stringify(STRUCTURED_DATA);
