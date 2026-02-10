import { Body4 } from "@/components/design-system/body";
import { mdxComponents } from "@/components/shared/mdx-content";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils.js";
import { MDXProvider } from "@mdx-js/react";
import { IconMinimize45 } from "central-icons/IconMinimize45";
import { ComponentType } from "react";
import { useData } from "vike-react/useData";
import type { Data } from "./+data.js";

const mdxModules = import.meta.glob("/content/collection/*.mdx", { eager: true }) as Record<
  string,
  { default: ComponentType }
>;

export default function Page() {
  const item = useData<Data>();

  const modulePath = `/content/collection/${item.slug}.mdx`;
  const MDXContent = mdxModules[modulePath]?.default;

  if (!MDXContent) {
    return <div>Content not found: {modulePath}</div>;
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto -mt-[7px] w-full max-w-5xl px-4 md:-mt-2 md:px-0">
        <Body4 className="mb-10 font-mono capitalize text-primary md:mb-4">{item.type}</Body4>
        <Link
          href="/collection"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "absolute right-6 top-0 flex h-8 w-8 items-center justify-center rounded-full",
          )}
        >
          <IconMinimize45 className="h-4 w-4 shrink-0 animate-fade-in" />
        </Link>
        <div className="flex h-full w-full items-center justify-center pt-0">
          <article className={cn(proseVariants({ variant: "default" }), "-mt-7 w-full max-w-lg")}>
            <MDXProvider components={mdxComponents}>
              <MDXContent />
            </MDXProvider>
          </article>
        </div>
      </div>
    </div>
  );
}
