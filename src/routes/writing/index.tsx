import { Body2 } from "@/components/design-system/body";
import { H1, H3 } from "@/components/design-system/heading";
import { Link } from "@/components/ui/link";
import { WritingItem } from "@/features/writing/types";
import { getContent, getContentSource } from "@/lib/mdx";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const getWritingItems = createServerFn().handler(async () => {
  const items = await getContent("writing");
  return items.map((item) => ({
    ...item,
    content: getContentSource("writing", item.slug)
      .replace(/^---[\s\S]*?---\n?/, "")
      .replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, "\n\n[IMAGE]\n\n")
      .replace(/<(Image|img)\b[^>]*\/?>/gi, "\n\n[IMAGE]\n\n")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "\n\n[IMAGE]\n\n")
      .replace(/<[^>]+>/g, "")
      .trim()
      .slice(0, 800),
  }));
});

export const Route = createFileRoute("/writing/")({
  loader: () => getWritingItems(),
  head: () => ({
    meta: [
      { title: "Writing • Florian - Design Engineer" },
      {
        name: "description",
        content: "Writing contains thoughts, ideas, and experiences from Florian.",
      },
      { property: "og:title", content: "Writing" },
      {
        property: "og:description",
        content: "Writing contains thoughts, ideas, and experiences from Florian.",
      },
      { property: "og:image", content: "/api/og?title=Writing" },
      { name: "twitter:title", content: "Writing" },
      {
        name: "twitter:description",
        content: "Writing contains thoughts, ideas, and experiences from Florian.",
      },
      { name: "twitter:image", content: "/api/og?title=Writing" },
    ],
  }),
  component: WritingPage,
});

type Line = { type: "heading" | "text" | "image"; width: number };

function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function generateLines(content: string, max: number): Line[] {
  const result: Line[] = [];
  const blocks = content
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const CHARS_PER_LINE = 28;
  const rand = seededRand(hashString(content));

  for (const block of blocks) {
    if (result.length >= max) break;

    if (block === "[IMAGE]") {
      result.push({ type: "image", width: 100 });
      continue;
    }

    const isHeading = /^#{1,6}\s/.test(block);
    const text = block.replace(/^#{1,6}\s+/, "").replace(/\s+/g, " ");

    if (isHeading) {
      const width = Math.min(75, Math.max(35, text.length * 4));
      result.push({ type: "heading", width });
      continue;
    }

    const lineCount = Math.max(1, Math.ceil(text.length / CHARS_PER_LINE));
    const remainder = text.length % CHARS_PER_LINE || CHARS_PER_LINE;
    for (let i = 0; i < lineCount && result.length < max; i++) {
      const isLast = i === lineCount - 1;
      const width = isLast
        ? Math.max(40, Math.round((remainder / CHARS_PER_LINE) * 100))
        : Math.round(80 + rand() * 20);
      result.push({ type: "text", width });
    }
  }

  return result;
}

function WritingIllustration({ content }: { content: string }) {
  const lines = generateLines(content, 5);
  return (
    <div className="w-12 h-14 shrink-0 rounded-sm bg-primary p-1.5 flex flex-col gap-1 outline -outline-offset-1 outline-black/10 dark:outline-white/15 shadow-xs">
      {lines.map((line, i) =>
        line.type === "image" ? (
          <div
            key={i}
            className="h-4 w-full rounded-[2px] bg-neutral-200/70 dark:bg-neutral-800/70"
          />
        ) : (
          <div
            key={i}
            className={cn(
              "h-[3px] rounded-full",
              line.type === "heading"
                ? "bg-neutral-300/70 dark:bg-neutral-700/70"
                : "bg-neutral-200/70 dark:bg-neutral-800/70",
            )}
            style={{ width: `${line.width}%` }}
          />
        ),
      )}
    </div>
  );
}

function formatDate(date: string | number | undefined) {
  if (date === undefined || date === null || date === "") return "";
  const s = String(date);
  if (/^\d{4}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function WritingPage() {
  const items = Route.useLoaderData() as (WritingItem & { content: string })[];

  return (
    <div className="w-full max-w-5xl mx-auto md:px-0 px-4">
      <H1 className="mb-8">Writing</H1>
      <div className="flex flex-col">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/writing/${item.slug}`}
            className="relative flex items-center gap-4 py-3 px-3 -mx-3 group/item"
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-lg bg-secondary opacity-0 scale-[0.99] transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover/item:opacity-100 [@media(hover:hover)]:group-hover/item:scale-100"
            />
            <div className="relative">
              <WritingIllustration content={item.content} />
            </div>
            <div className="relative flex flex-col gap-0.5 min-w-0">
              <H3>{item.title}</H3>
              <Body2 className="text-tertiary">{formatDate(item.date)}</Body2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
