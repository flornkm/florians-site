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
      <div className="w-full h-screen flex flex-col items-start justify-center max-w-sm mx-auto px-4">
        <Animation
          riveParams={{
            src: "/animations/florian.riv",
            artboard: "cutout",
            autoplay: true,
            animations: ["play"],
          }}
          className="absolute dark:hidden animate-in fade-in zoom-in inset-0 -z-10 pointer-events-none [@media(max-height:500px)]:hidden h-80 max-lg:hidden max-w-lg left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
        />
        <h1 className="text-lg font-semibold mb-1">Someone cut out this page.</h1>
        <p className="text-ms text-neutral-500 mb-5">But no worries, here are some pages you can try instead.</p>
        <ul className="space-x-2 flex flex-wrap">
          {links.map((link, index) => (
            <li className="text-ms" key={link.href}>
              <Link href={link.href} className={buttonVariants({ variant: index === 0 ? "primary" : "secondary" })}>
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
      <p className="text-ms text-neutral-500 mb-5">Internal server error. Please try again later.</p>
      <Button variant="primary" onClick={() => window.location.reload()} className="flex-0">
        Reload
      </Button>
    </div>
  );
}
