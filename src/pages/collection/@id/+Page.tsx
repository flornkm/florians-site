import { Body4 } from "@/components/design-system/body.jsx";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { buttonVariants } from "@/components/ui/button.jsx";
import { Link } from "@/components/ui/link.jsx";
import { cn } from "@/lib/utils.js";
import { IconArrowDownLeft } from "central-icons/IconArrowDownLeft";
import { useData } from "vike-react/useData";
import type { Data } from "./+data.js";

export default function Page() {
  const item = useData<Data>();

  return (
    <div className="w-full">
      <div className="w-full relative max-w-5xl md:px-0 px-4 mx-auto -mt-2">
        <Body4 className="capitalize text-black dark:text-white mb-4 font-mono">{item.type}</Body4>
        <Link
          href="/collection"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "absolute top-0 right-6 w-8 h-8 rounded-full flex items-center justify-center",
          )}
        >
          <IconArrowDownLeft className="w-4 h-4 shrink-0" />
        </Link>
        <div className="w-full h-full flex items-center justify-center pt-0">
          <MarkdownRenderer html={item.content || ""} className="max-w-lg w-full -mt-7" />
        </div>
      </div>
    </div>
  );
}
