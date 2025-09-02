import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { usePageContext } from "vike-react/usePageContext";

import Footer from "@/components/shared/footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "../components/shared/navigation";
import { cn } from "../lib/utils";

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext();
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!pageContext.is404 && <Navigation />}
        <main className={cn("w-full min-h-screen dark:bg-black md:px-4", !pageContext.is404 && "py-8")}>
          {children}
        </main>
        <Footer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
