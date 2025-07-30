import "@/styles/globals.css";

import React from "react";
import { usePageContext } from "vike-react/usePageContext";
import Navigation from "../components/shared/navigation";
import { cn } from "../lib/utils";

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext();

  return (
    <>
      {!pageContext.is404 && <Navigation />}
      <main className={cn("w-full min-h-screen dark:bg-black", !pageContext.is404 && "py-8")}>{children}</main>
    </>
  );
}
