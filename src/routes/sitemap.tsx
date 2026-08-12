import { H1 } from "@/components/design-system/heading";
import { Link } from "@/components/ui/link";
import { getContent } from "@/lib/mdx";
import { createFileRoute, useRouter } from "@tanstack/react-router";

// Derived, never maintained: every static path the file-based router knows about, plus the MDX
// slugs that stand in for the one dynamic route (/writing/$id). A new route file lands here on
// its own; only a second dynamic route would need a line adding.
function useSitePaths(): string[] {
  const router = useRouter();
  const staticPaths = Object.keys(router.routesByPath).filter(
    (path) => path.startsWith("/") && !path.includes("$"),
  );
  const writingPaths = getContent("writing").map((entry) => entry.url);
  // Index routes come through with a trailing slash ("/writing/"); the bare path is the real URL.
  const paths = [...staticPaths, ...writingPaths].map((path) => path.replace(/(.+)\/$/, "$1"));
  return [...new Set(paths)].sort();
}

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { title: "Sitemap ‹ Florian Kiem" },
      { name: "description", content: "Every page on this site." },
    ],
  }),
  component: SitemapPage,
});

function SitemapPage() {
  const paths = useSitePaths();

  return (
    <div className="grid grid-cols-6 gap-x-3 md:grid-cols-9 md:gap-x-6">
      <div className="col-start-1 col-span-6 md:col-start-3 md:col-span-4">
        <H1 className="mb-6">Sitemap</H1>
        <ul className="space-y-1">
          {paths.map((path) => (
            <li key={path}>
              <Link
                href={path}
                className="text-sm font-normal text-secondary transition-colors hover:text-primary"
              >
                {path}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
