import { Heading } from "@/lib/mdx";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { H4 } from "../design-system/heading";

export default function ScrollWheel({ headings }: { headings: Heading[] }) {
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0 || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66% 0px" },
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-2 text-ms">
      <H4 className="mb-3 font-medium">On this page</H4>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:text-primary",
              activeHeading === heading.id ? "font-medium text-primary" : "text-tertiary",
              heading.level > 1 ? `ml-${(heading.level - 1) * 2}` : "",
            )}
            onClick={() => scrollToHeading(heading.id)}
          >
            {heading.text}
          </li>
        ))}
      </ul>
    </nav>
  );
}
