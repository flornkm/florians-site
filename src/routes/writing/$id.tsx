import { useMdxContent } from "@/components/shared/mdx-content";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  extractHeadings,
  getContent,
  getContentSource,
  isWritingEntry,
  type WritingEntry,
} from "@/lib/mdx";
import { cn } from "@/lib/utils";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { IconChevronLeft } from "central-icons/IconChevronLeft";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const getWritingItem = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const items = await getContent("writing");
    const itemRaw = items.find((i) => i.slug === slug);

    if (!itemRaw) {
      throw notFound();
    }

    if (!isWritingEntry(itemRaw)) {
      throw new Error(`Item ${slug} is missing required fields`);
    }

    const item: WritingEntry = itemRaw;

    const collaborators =
      typeof item.collaborators === "string"
        ? item.collaborators.split(",").map((c: string) => c.trim())
        : item.collaborators || [];

    const source = await getContentSource("writing", item.slug);
    const headings = extractHeadings(source).filter((h) => h.level > 1);

    return {
      slug: item.slug,
      title: item.title,
      description: item.description,
      type: item.type,
      collaborators,
      headings,
    };
  });

export const Route = createFileRoute("/writing/$id")({
  loader: ({ params }) => getWritingItem({ data: params.id }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      meta: [
        { title: `${loaderData.title} • Florian - Design Engineer` },
        { name: "description", content: loaderData.description },
        { property: "og:image", content: `/api/og?title=${encodeURIComponent(loaderData.title)}` },
      ],
    };
  },
  component: WritingDetailPage,
});

const SCROLL_OFFSET = 80;

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

function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

function WritingDetailPage() {
  const item = Route.useLoaderData();
  const content = useMdxContent("writing", item.slug, "-mt-7 w-full max-w-lg");
  const activeId = useActiveHeading(item.headings.map((h) => h.id));

  if (!content) {
    return <div>Content not found</div>;
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto -mt-[7px] w-full max-w-5xl px-4 pt-9 md:-mt-2 md:px-0">
        <aside className="hidden lg:block absolute left-0 top-0 bottom-0 w-44 lg:w-52 xl:w-60 z-10">
          <div className="sticky top-20">
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href="/writing"
                className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary transition-colors mb-5"
              >
                <IconChevronLeft className="h-4 w-4" />
                Go back
              </Link>
            </motion.div>
            {item.headings.length > 0 && (
              <nav className="pl-5 lg:pl-6 max-w-32 lg:max-w-40 xl:max-w-48">
                <ul className="flex flex-col gap-1.5">
                  {item.headings.map((heading, i) => (
                    <motion.li
                      key={heading.id}
                      initial={{ opacity: 0, x: -8, filter: "blur(2px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0)" }}
                      transition={{
                        duration: 0.4,
                        delay: 0.1 + i * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <a
                        href={`#${heading.id}`}
                        onClick={(e) => handleAnchorClick(e, heading.id)}
                        className={cn(
                          "text-sm leading-relaxed transition-colors",
                          activeId === heading.id
                            ? "text-primary font-medium"
                            : "text-quaternary hover:text-primary",
                        )}
                      >
                        {heading.text}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </aside>
        <div className="sticky top-[calc(100dvh-6.75rem)] z-10 lg:hidden flex justify-center h-0">
          <Link
            href="/writing"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "gap-1")}
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
