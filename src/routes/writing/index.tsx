import { Body2 } from "@/components/design-system/body";
import { H3 } from "@/components/design-system/heading";
import { Link } from "@/components/ui/link";
import { PostIcon } from "@/features/writing/components/post-icon";
import { getContent } from "@/lib/mdx";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

type WritingListItem = { slug: string; title: string; date: string };

const getWritingItems = createServerFn().handler(async (): Promise<WritingListItem[]> => {
  const items = await getContent("writing");
  return items.map((item) => ({
    slug: item.slug,
    title: String(item.title ?? item.slug),
    date: String(item.date ?? ""),
  }));
});

export const Route = createFileRoute("/writing/")({
  loader: () => getWritingItems(),
  head: () => ({
    meta: [
      { title: "Writing ‹ Florian Design Engineer" },
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

function formatDate(date: string | undefined) {
  if (!date) return "";
  if (/^\d{4}$/.test(date)) return date;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getYear(date: string | undefined) {
  if (!date) return "";
  const matches = String(date).match(/\d{4}/g);
  return matches ? String(Math.max(...matches.map(Number))) : "";
}

function groupByYear(items: WritingListItem[]) {
  const groups: { year: string; items: WritingListItem[] }[] = [];
  for (const item of items) {
    const year = getYear(item.date);
    const last = groups[groups.length - 1];
    if (last && last.year === year) {
      last.items.push(item);
    } else {
      groups.push({ year, items: [item] });
    }
  }
  return groups;
}

function WritingPage() {
  const items = Route.useLoaderData();
  const groups = groupByYear(items);

  return (
    <div className="flex flex-col gap-12">
      {groups.map((group) => (
        <section key={group.year} className="md:grid md:grid-cols-9 md:gap-x-6">
          <div className="flex flex-col gap-3 md:col-start-1 md:col-span-7">
            <H3 className="text-tertiary">{group.year}</H3>
            <div className="border-t border-primary" />
          </div>
          <div className="mt-4 flex flex-col md:col-start-3 md:col-span-5">
            {group.items.map((item) => (
              <Link
                key={item.slug}
                href={`/writing/${item.slug}`}
                className="group/item flex items-center gap-4 py-3"
              >
                <div className="flex size-12 shrink-0 items-center justify-center bg-image-card transition-colors duration-200 group-hover/item:bg-[#e7e7e7] dark:group-hover/item:bg-[#1c1c1c]">
                  <PostIcon slug={item.slug} className="size-6" />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <H3>{item.title}</H3>
                  <Body2 className="text-tertiary">{formatDate(item.date)}</Body2>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
