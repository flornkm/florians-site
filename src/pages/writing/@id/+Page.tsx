import { useMdxContent } from "@/components/shared/mdx-content";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { IconChevronLeft } from "central-icons/IconChevronLeft";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useData } from "vike-react/useData";
import type { Data } from "./+data.js";

function useActiveHeading(headingIds: string[]) {
  const [activeId, setActiveId] = useState<string>("");
  const visibleRef = useRef(new Set<string>());

  useEffect(() => {
    if (!headingIds.length) return;
    const visible = visibleRef.current;
    visible.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }

        // Pick the first visible heading in document order
        if (visible.size > 0) {
          for (const id of headingIds) {
            if (visible.has(id)) {
              setActiveId(id);
              return;
            }
          }
        }

        // No headings visible — find the last one that scrolled past the top
        let last = "";
        for (const id of headingIds) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < SCROLL_OFFSET) {
            last = id;
          }
        }
        if (last) setActiveId(last);
      },
      { rootMargin: `-${SCROLL_OFFSET}px 0px 0px 0px`, threshold: 0 },
    );

    for (const id of headingIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headingIds]);

  return activeId;
}

const SCROLL_OFFSET = 80;

function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function Page() {
  const item = useData<Data>();
  const content = useMdxContent("writing", item.slug, "-mt-7 w-full max-w-lg");
  const activeId = useActiveHeading(item.headings.map((h) => h.id));

  if (!content) {
    return <div>Content not found</div>;
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto -mt-[7px] w-full max-w-5xl px-4 pt-9 md:-mt-2 md:px-0 md:pt-9">
        <aside
          className="hidden md:block fixed top-20 w-44 z-10"
          style={{ left: "max(1rem, calc((100vw - 64rem) / 2))" }}
        >
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/writing"
              className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary transition-colors mb-4"
            >
              <IconChevronLeft className="h-4 w-4" />
              Go back
            </Link>
          </motion.div>
          {item.headings.length > 0 && (
            <nav className="pl-5 max-w-26">
              <ul className="flex flex-col gap-1">
                {item.headings.map((heading, i) => (
                  <motion.li
                    key={heading.id}
                    initial={{ opacity: 0, x: -8, filter: "blur(2px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0)" }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => handleAnchorClick(e, heading.id)}
                      className={cn(
                        "text-sm transition-colors",
                        activeId === heading.id ? "text-primary font-medium" : "text-quaternary hover:text-primary",
                      )}
                    >
                      {heading.text}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 md:hidden">
          <Link
            href="/writing"
            className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary transition-colors bg-surface-primary/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary shadow-sm"
          >
            <IconChevronLeft className="h-4 w-4" />
            Go back
          </Link>
        </div>
        <div className="flex justify-center pb-20 md:pb-80">{content}</div>
      </div>
    </div>
  );
}
