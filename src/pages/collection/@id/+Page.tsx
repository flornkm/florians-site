import { Body4 } from "@/components/design-system/body";
import { useMdxContent } from "@/components/shared/mdx-content";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils.js";
import { IconMinimize45 } from "central-icons/IconMinimize45";
import { useData } from "vike-react/useData";
import type { Data } from "./+data.js";

export default function Page() {
  const item = useData<Data>();
  const content = useMdxContent("collection", item.slug, "-mt-7 w-full max-w-lg");

  if (!content) {
    return <div>Content not found</div>;
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto -mt-[7px] w-full max-w-5xl px-4 md:-mt-2 md:px-0">
        <Body4 className="mb-10 font-mono capitalize text-primary md:mb-4">{item.type}</Body4>
        <Link
          href={`/collection#section-${item.slug}`}
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "absolute right-6 top-0 flex h-8 w-8 items-center justify-center rounded-full",
          )}
        >
          <IconMinimize45 className="h-4 w-4 shrink-0 animate-fade-in" />
        </Link>
        <div className="flex h-full w-full items-center justify-center pt-0">
          {content}
        </div>
      </div>
    </div>
  );
}
