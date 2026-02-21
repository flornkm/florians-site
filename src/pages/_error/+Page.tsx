import Animation from "@/components/shared/animation";
import Button, { buttonVariants } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { usePageContext } from "vike-react/usePageContext";

const links = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export default function Page() {
  const pageContext = usePageContext();

  if (pageContext.is404) {
    return (
      <div className="w-full h-screen flex flex-col items-start justify-center max-w-sm mx-auto px-8">
        <Animation
          riveParams={{
            src: "/animations/florian.riv",
            artboard: "cutout",
            autoplay: true,
            animations: ["play"],
          }}
          className="absolute dark:invert animate-in fade-in zoom-in inset-0 -z-10 pointer-events-none [@media(max-height:500px)]:hidden h-80 w-full left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
        />
        <h1 className="text-base font-semibold mb-0.5">Someone cut out this page out.</h1>
        <p className="text-sm text-tertiary mb-5">But no worries, these here are still there:</p>
        <ul className="space-x-2 flex flex-wrap">
          {links.map((link, index) => (
            <li className="text-sm" key={link.href}>
              <Link
                href={link.href}
                className={buttonVariants({ variant: index === 0 ? "primary" : "secondary", size: "sm" })}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-start justify-center max-w-sm mx-auto px-4">
      <h1 className="text-lg font-semibold mb-1">500 Error</h1>
      <p className="text-sm text-tertiary mb-5">Internal server error. Please try again later.</p>
      <Button variant="primary" onClick={() => window.location.reload()} className="flex-0">
        Reload
      </Button>
    </div>
  );
}
