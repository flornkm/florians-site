import { createFileRoute } from "@tanstack/react-router";
import { IconArrowUpRight } from "central-icons/IconArrowUpRight";
import type { ComponentType } from "react";

function DitherDemo() {
  return (
    <div className="dither dither-xs size-16 rounded-full dark:dither-sm">
      <div className="size-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#777777_55%,#1a1a1a)] dark:bg-[radial-gradient(circle_at_32%_28%,#ffffff,#b0b0b0_28%,#4a4a4a_62%,#000000_90%)]" />
    </div>
  );
}

function GradientBorderDemo() {
  return (
    <div
      className={
        "gradient-border flex h-9 items-center rounded-full px-4 text-sm fw-medium text-secondary shadow-sm " +
        "bg-linear-to-t from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-800 " +
        "[--gradient-border:linear-gradient(315deg,#ffffff_0%,#fafafa_50%,#ffffff_100%)] " +
        "dark:[--gradient-border:linear-gradient(315deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.1))]"
      }
    >
      Preview
    </div>
  );
}

function ShadowDemo() {
  return <div className="size-16 rounded-2xl bg-primary dark:bg-[#232323] smooth-shadow-ring-md" />;
}

const TOOLS: { name: string; href: string; demo: ComponentType }[] = [
  { name: "Dither", href: "https://dither.floriankiem.com", demo: DitherDemo },
  {
    name: "Gradient Border",
    href: "https://gradient-border.floriankiem.com",
    demo: GradientBorderDemo,
  },
  { name: "Shadow", href: "https://shadow.floriankiem.com", demo: ShadowDemo },
];

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools ‹ Florian Kiem" },
      {
        name: "description",
        content: "Small web tools built by Florian Kiem.",
      },
      { property: "og:title", content: "Tools" },
      {
        property: "og:description",
        content: "Small web tools built by Florian Kiem.",
      },
      { property: "og:image", content: "/api/og?title=Tools" },
      { name: "twitter:title", content: "Tools" },
      {
        name: "twitter:description",
        content: "Small web tools built by Florian Kiem.",
      },
      { name: "twitter:image", content: "/api/og?title=Tools" },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <div className="grid grid-cols-9 gap-x-6">
      <div className="col-start-1 col-span-9 md:col-start-3 md:col-span-5">
        <h1 className="mb-6 text-base fw-medium leading-snug text-primary">Tools</h1>
        <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <li key={tool.name}>
              <a
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2.5"
              >
                <div className="flex aspect-[16/10] items-center justify-center bg-image-card transition-colors duration-200 group-hover:bg-[#efefef] dark:group-hover:bg-[#161616]">
                  <tool.demo />
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-tertiary transition-colors group-hover:text-secondary">
                  {tool.name}
                  <IconArrowUpRight className="size-3.5 -translate-x-0.5 translate-y-0.5 opacity-0 blur-[2px] transition duration-150 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-none" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
