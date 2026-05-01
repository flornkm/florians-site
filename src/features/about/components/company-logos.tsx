import { Image } from "@/components/shared/image";
import { Link } from "@/components/ui/link";
import { COMPANIES } from "../const/companies";

export function CompanyLogos() {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
      {COMPANIES.map((company) => (
        <Link
          key={company.name}
          href={company.url}
          target="_blank"
          className="flex items-center justify-center group"
        >
          <Image
            src={company.logo}
            alt={company.name}
            objectFit="contain"
            style={{ width: company.width }}
            className="max-w-none opacity-40 group-hover:opacity-80 transition-opacity"
            imgClassName="dark:invert"
          />
        </Link>
      ))}
    </div>
  );
}
