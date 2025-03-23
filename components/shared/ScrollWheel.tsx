import { useEffect, useState } from "react";

export default function ScrollWheel({ html }: { html: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  useEffect(() => {
    if (!html) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const headingElements = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6");

    const extractedHeadings = Array.from(headingElements).map((heading) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || "";

      let id = heading.id;
      if (!id) {
        id = text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");
        heading.id = id;
      }

      return { id, text, level };
    });

    setHeadings(extractedHeadings);
  }, [html]);

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
    <nav className="space-y-2 text-sm">
      <h4 className="font-medium text-neutral-800 mb-3">On this page</h4>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`cursor-pointer transition-all duration-200 hover:text-neutral-800
              ${activeHeading === heading.id ? "text-neutral-800 font-medium" : "text-neutral-500"}
              ${heading.level > 1 ? `ml-${(heading.level - 1) * 2}` : ""}`}
            onClick={() => scrollToHeading(heading.id)}
          >
            {heading.text}
          </li>
        ))}
      </ul>
    </nav>
  );
}
