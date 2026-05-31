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

function WritingPage() {
  const items = Route.useLoaderData();

  return (
    <div className="md:grid md:grid-cols-9 md:gap-x-6">
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:col-start-3 md:col-span-5 md:grid-cols-3">
        {items.map((item) => (
          <Link key={item.slug} href={`/writing/${item.slug}`} className="group/item flex flex-col">
            <div className="flex aspect-[3/2] w-full items-center justify-center bg-image-card transition-colors duration-200 group-hover/item:bg-[#e7e7e7] dark:group-hover/item:bg-[#1c1c1c]">
              <PostIcon slug={item.slug} className="h-14 w-14" />
            </div>
            <div className="mt-2 flex min-w-0 flex-col gap-0.5">
              <H3>{item.title}</H3>
              <Body2 className="text-tertiary">{formatDate(item.date)}</Body2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
