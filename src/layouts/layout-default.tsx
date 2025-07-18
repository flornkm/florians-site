import "@/styles/globals.css";

import React from "react";
import { usePageContext } from "vike-react/usePageContext";
import Navigation from "../components/shared/navigation";
import SvgFilter from "../components/shared/svg-filter";
import { cn } from "../lib/utils";

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext();

  return (
    <div>
      {!pageContext.is404 && <Navigation />}
      <main className={cn("w-full min-h-screen", !pageContext.is404 && "py-8")}>{children}</main>
      <SvgFilter />
    </div>
  );
}
