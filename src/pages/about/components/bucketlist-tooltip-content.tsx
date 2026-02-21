import { Body4 } from "@/components/design-system/body";
import { IconAspectRatio11 } from "central-icons/IconAspectRatio11";
import { IconCheckmark2Small } from "central-icons/IconCheckmark2Small";
import { BUCKETLIST } from "../const/bucketlist";

export function BucketlistTooltipContent() {
  return (
    <div className="w-[220px] space-y-3">
      <ul className="space-y-1.5">
        {BUCKETLIST.filter((item) => !item.completed).map((item) => (
          <li key={item.title} className="flex items-start gap-1.5">
            <IconAspectRatio11 className="shrink-0 size-4 mt-px" />
            <Body4 className="font-medium text-primary">{item.title}</Body4>
          </li>
        ))}
      </ul>
      <ul className="space-y-1.5">
        {BUCKETLIST.filter((item) => item.completed).map((item) => (
          <li key={item.title} className="flex items-start gap-1.5 text-quaternary">
            <IconCheckmark2Small className="shrink-0 size-4 mt-px" />
            <Body4 className="font-medium">{item.title}</Body4>
          </li>
        ))}
      </ul>
    </div>
  );
}
