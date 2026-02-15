import { Body2 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import { mdxComponents } from "@/components/shared/mdx-content";
import Section from "@/components/shared/section";
import { Link } from "@/components/ui/link";
import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils";
import { MDXProvider } from "@mdx-js/react";
import { IconChevronLeft } from "central-icons/IconChevronLeft";
import { ComponentType } from "react";
import { useData } from "vike-react/useData";
import type { Data } from "./+data.js";

const mdxModules = import.meta.glob("/content/blog/*.mdx", { eager: true }) as Record<
  string,
  { default: ComponentType }
>;

export default function Page() {
  const post = useData<Data>();

  const modulePath = `/content/blog/${post.slug}.mdx`;
  const MDXContent = mdxModules[modulePath]?.default;

  if (!MDXContent) {
    return <div>Content not found: {modulePath}</div>;
  }

  return (
    <div className="w-full">
      <Section as="div" className="mx-auto w-full max-w-5xl px-4 md:px-0">
        <div className="shrink-0 flex-1">
          <Link href="/blog" className="group/link mb-2 flex w-auto items-start gap-2 text-ms font-medium">
            <IconChevronLeft className="mt-1.5 h-4 w-4" />
            <div className="h-7 flex-1">
              <div className="pointer-events-none transition-all duration-200 ease-out group-hover/link:-translate-y-[25.5px] group-focus-within/link:-translate-y-[25.5px]">
                <H1 className="transition-all duration-200 ease-out group-hover/link:opacity-0 group-hover/link:blur-[1px] group-focus-within/link:opacity-0 group-focus-within/link:blur-[1px]">
                  {post.title} <span className="text-ms text-quaternary">{post.date.split("/")[1]}</span>
                </H1>
                <span
                  className={cn(
                    "truncate opacity-0 blur-[1px] transition-all duration-200 ease-out focus:hidden",
                    "group-hover/link:opacity-100 group-hover/link:blur-none group-active/link:opacity-100 group-focus-within/link:opacity-100 group-focus-within/link:blur-none",
                  )}
                >
                  Back to blog
                </span>
              </div>
            </div>
          </Link>
          <Body2 className="mb-8 text-secondary">{post.description}</Body2>
        </div>
        <div className="w-full">
          <MDXProvider components={mdxComponents}>
            <div className={cn(proseVariants({ variant: "default" }), "max-w-none")}>
              <MDXContent />
            </div>
          </MDXProvider>
        </div>
      </Section>
    </div>
  );
}
