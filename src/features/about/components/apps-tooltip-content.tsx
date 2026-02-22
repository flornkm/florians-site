import { Link } from "@/components/ui/link";
import { TOOLS } from "../const/tools";

export function AppsTooltipContent() {
  return (
    <div className="grid grid-cols-4 gap-2.5 p-1">
      {TOOLS.map((tool) => (
        <Link key={tool.name} href={tool.link} target="_blank" className="cursor-default">
          <div className="relative group">
            <img
              src={tool.icon}
              alt={tool.name}
              className="size-10 object-cover rounded-[10px] cursor-pointer border border-primary"
            />
            <div className="group-hover:opacity-10 group-active:opacity-20 pointer-events-none transition-all bg-inverted opacity-0 rounded-[10px] inset-0 absolute" />
          </div>
        </Link>
      ))}
    </div>
  );
}
