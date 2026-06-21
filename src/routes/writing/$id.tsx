import { H1 } from "@/components/design-system/heading";
import { useMdxContent } from "@/components/shared/mdx-content";
import { Link } from "@/components/ui/link";
import { resolvePostIcon } from "@/features/writing/lib/post-icon";
import { fetchNewestRunDate } from "@/features/writing/lib/newest-run-date";
import { toStandaloneSvg } from "@/features/writing/lib/icon-svg";
import { getContent, isWritingEntry, type WritingEntry } from "@/lib/mdx";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { IconArrowUndoUp } from "central-icons/IconArrowUndoUp";
import dayjs from "dayjs";

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

    // Live posts (e.g. runs) carry no frontmatter date — they show their newest synced run's date.
    let date = typeof item.date === "string" ? item.date : "";
    if (item.type === "live") {
      const newestRunDate = await fetchNewestRunDate();
      if (newestRunDate) date = newestRunDate;
    }

    // Pre-render the mark so the OG card shows the same icon as the grid.
    const iconSvg = toStandaloneSvg(resolvePostIcon(item.slug), 200);
    const icon = Buffer.from(iconSvg).toString("base64");

    return {
      slug: item.slug,
      title: item.title,
      description: item.description,
      type: item.type,
      date,
      collaborators,
      icon,
    };
  });

export const Route = createFileRoute("/writing/$id")({
  loader: ({ params }) => getWritingItem({ data: params.id }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const ogImage =
      `/api/og?writing=1&title=${encodeURIComponent(loaderData.title)}` +
      `&icon=${encodeURIComponent(loaderData.icon)}`;
    return {
      meta: [
        { title: `${loaderData.title} ‹ Florian Design Engineer` },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:image", content: ogImage },
        { name: "twitter:title", content: loaderData.title },
        { name: "twitter:description", content: loaderData.description },
        { name: "twitter:image", content: ogImage },
      ],
    };
  },
  component: WritingDetailPage,
});

function WritingDetailPage() {
  const item = Route.useLoaderData();
  const content = useMdxContent(
    "writing",
    item.slug,
    // Prose <h1> is hidden (the header above is the title). On mobile everything spans the full content
    // width; from md up, text is capped/centered while media stays full width.
    "w-full [&>h1]:hidden [&>h1+*]:mt-0 md:[&>*:not(h1)]:mx-auto md:[&>:not(div):not(figure):not(h1)]:max-w-[460px]",
  );
  const parsedDate = dayjs(item.date);
  const formattedDate = item.date && parsedDate.isValid() ? parsedDate.format("MMMM D, YYYY") : "";
  const dateLabel = item.type === "live" ? `Last update: ${formattedDate}` : formattedDate;

  if (!content) {
    return <div>Content not found</div>;
  }

  return (
    <div className="w-full">
      {/* Mirror the /writing index grid so the article column lines up with it. The root layout
          already supplies the mobile side padding (px-6), so no extra px here. */}
      <div className="-mt-[7px] pt-2.5 md:-mt-2 md:grid md:grid-cols-9 md:gap-x-6 lg:pt-9">
        <aside className="hidden md:col-span-2 md:col-start-1 md:-mt-7 md:block">
          <div className="md:sticky md:top-9">
            <Link
              href="/writing"
              aria-label="Go back"
              className="inline-flex size-6.5 items-center justify-center rounded-sm bg-interactive-secondary text-primary transition-colors hover:bg-interactive-secondary-hover"
            >
              <IconArrowUndoUp className="size-4" />
            </Link>
          </div>
        </aside>
        <div className="md:col-span-5 md:col-start-3">
          <div className="mb-6 md:hidden">
            <Link
              href="/writing"
              aria-label="Go back"
              className="inline-flex size-7.5 shrink-0 items-center justify-center rounded-sm bg-interactive-secondary text-primary transition-colors hover:bg-interactive-secondary-hover"
            >
              <IconArrowUndoUp className="size-4" />
            </Link>
          </div>
          <header className="mb-8 md:-mt-7 md:mb-10">
            <H1 className="text-sm">{item.title}</H1>
            {formattedDate && <p className="mt-1.5 text-sm text-tertiary">{dateLabel}</p>}
          </header>
          <div className="pb-16 md:pb-24">{content}</div>
        </div>
      </div>
    </div>
  );
}
