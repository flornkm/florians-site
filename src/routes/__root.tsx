import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRoute, useLocation } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";

import Footer from "@/components/shared/footer";
import Navigation from "@/components/shared/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";

import Button, { buttonVariants } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

const queryClient = new QueryClient();

if (typeof window !== "undefined") {
  console.info(
    `%cPersonal Site of Florian %cThanks for visiting my place of the internet. If you're seeing this you're probably a programmer (or a bot).
Feel free to send me a screenshot of your console so I know someone found this easter egg.`,
    "color: #fff; font-size: 20px; font-weight: medium; margin-top: 10px; margin-bottom: 10px;",
    "color: #a3a3a3; font-size: 12px; margin-top: 10px; margin-bottom: 10px;",
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Florian Design Engineer" },
      {
        name: "description",
        content:
          "The personal site of Florian Kiem - a design engineer, bridging the gap between creativity and logic in this portfolio.",
      },
      { property: "og:title", content: "Florian Design Engineer" },
      {
        property: "og:description",
        content:
          "The personal site of Florian Kiem - a design engineer, bridging the gap between creativity and logic in this portfolio.",
      },
      { property: "og:image", content: "/api/og?title=Design%20Engineer" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Florian Design Engineer" },
      {
        name: "twitter:description",
        content:
          "The personal site of Florian Kiem - a design engineer, bridging the gap between creativity and logic in this portfolio.",
      },
      { name: "twitter:image", content: "/api/og?title=Design%20Engineer" },
    ],
    links: [
      {
        // crossOrigin is required for the font preload to be reused.
        rel: "preload",
        href: "/fonts/ciron-text/CironText-VF.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "icon",
        href: "/images/icons/favicon.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        href: "/images/icons/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    scripts: import.meta.env.DEV
      ? [
          {
            src: "//unpkg.com/react-scan/dist/auto.global.js",
            crossOrigin: "anonymous",
          },
        ]
      : [],
  }),
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

/** Routes that render full-screen without navigation or footer. */
const CHROMELESS = new Set<string>([]);

function RootLayout() {
  const { pathname } = useLocation();
  const isChromeless = CHROMELESS.has(pathname);
  const isHome = pathname === "/";
  // Home already shows Colophon/Experiments in its sidebar, so its footer drops the "More" column.
  const footerVariant = isHome ? "indent" : "default";

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.prepend(document.createComment(${JSON.stringify(
              `
       ________              _
      / ____/ /___  _____   (_)___ _____
     / /_  / / __ \\/ ___/  / / __ \`/ __ \\
    / __/ / / /_/ / /     / / /_/ / / / /
   /_/   /_/\\____/_/     /_/\\__,_/_/ /_/

   Personal site of Florian. You just found another
   easter egg. Let me know you found it!
`,
            )}));`,
          }}
        />
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {!isChromeless && <Navigation />}
            <main
              className={
                isChromeless
                  ? "w-full h-dvh"
                  : `mx-auto w-full max-w-[2000px] min-h-screen px-6 pt-4 ${isHome ? "pb-0" : "pb-16"}`
              }
            >
              <Outlet />
            </main>
            {!isChromeless && <Footer variant={footerVariant} />}
          </TooltipProvider>
        </QueryClientProvider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}

const errorLinks = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "/contact" },
];

function NotFoundPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-10rem)] flex flex-col items-start justify-center max-w-sm mx-auto px-8">
      <h1 className="text-base font-semibold mb-0.5">Oops, someone cut this page loose.</h1>
      <p className="text-sm text-tertiary mb-5">But no worries, these here are still there:</p>
      <ul className="space-x-2 flex flex-wrap">
        {errorLinks.map((link, index) => (
          <li className="text-sm" key={link.href}>
            <Link
              href={link.href}
              className={buttonVariants({
                variant: index === 0 ? "primary" : "secondary",
                size: "md",
              })}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorPage() {
  return (
    <div className="w-full h-screen flex flex-col items-start justify-center max-w-sm mx-auto px-4">
      <h1 className="text-lg font-semibold mb-1">500 Error</h1>
      <p className="text-sm text-tertiary mb-5">Internal server error. Please try again later.</p>
      <Button variant="primary" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}
