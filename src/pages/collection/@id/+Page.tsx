import { Body4 } from "@/components/design-system/body.jsx";
import { proseVariants } from "@/lib/prose-variants";
import { useData } from "vike-react/useData";
import type { Data } from "./+data.js";

export default function Page() {
  const item = useData<Data>();

  return (
    <div className="w-full">
      <div className="w-full max-w-5xl md:px-0 px-4 mx-auto -mt-2">
        <div className="flex w-full pt-0 gap-8">
          <Body4 className="capitalize text-black dark:text-white mb-4 font-mono">{item.type}</Body4>
          <div className="w-full h-full flex items-start justify-center pt-8 pl-8">
            <article
              className={`${proseVariants.default} max-w-lg w-full -ml-23`}
              dangerouslySetInnerHTML={{ __html: item.content || "" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
