import { Link } from "@/components/ui/link";
import { IconArrowUpRight } from "central-icons/IconArrowUpRight";

export const LogoHover = ({
  entity,
}: {
  entity: {
    url: string;
    name: string;
    logo: string;
  };
}) => {
  return (
    <div className="group w-28 shrink-0 relative">
      <Link
        className="absolute line-clamp-1 z-10 cursor-pointer inset-0 text-center text-neutral-500 opacity-0 group-hover:opacity-100 blur-[2px] transition-all group-hover:blur-none"
        href={entity.url}
        target="_blank"
      >
        {entity.name}
        <IconArrowUpRight className="w-4 h-4 inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 ease-out" />
      </Link>
      <img
        src={entity.logo}
        alt={entity.name}
        className="h-6 opacity-50 mx-auto group-hover:blur-[2px] group-hover:opacity-10 transition-all dark:invert"
      />
    </div>
  );
};
