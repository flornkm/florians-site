import { Link } from "@/components/ui/link";
import { INSTITUTIONS } from "../const/institutions";

export function InstitutionsTooltipContent() {
  return (
    <div className="flex gap-6 p-1 items-center">
      {INSTITUTIONS.map((inst) => (
        <Link key={inst.name} href={inst.url} target="_blank" className="flex items-center justify-center h-10 group">
          <img
            src={inst.logo}
            alt={inst.name}
            style={{ width: Math.min(inst.width, 80) }}
            className="opacity-60 group-hover:opacity-100 px-1 transition-opacity dark:invert"
          />
        </Link>
      ))}
    </div>
  );
}
