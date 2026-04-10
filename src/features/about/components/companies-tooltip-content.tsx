import { Link } from "@/components/ui/link";
import { COMPANIES } from "../const/companies";

export function CompaniesTooltipContent() {
  return (
    <div className="grid grid-cols-3 gap-6 p-1 w-[300px]">
      {COMPANIES.filter((c) => c.logo && c.width).map((company) => (
        <Link
          key={company.name}
          href={company.url}
          target="_blank"
          className="flex items-center justify-center h-12 group"
        >
          <img
            src={company.logo}
            alt={company.name}
            style={{ width: Math.min(company.width!, 80) }}
            className="max-w-none opacity-60 px-1 group-hover:opacity-100 transition-opacity dark:invert"
          />
        </Link>
      ))}
    </div>
  );
}
