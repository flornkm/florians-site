import "./globals.css";

import React from "react";
import Navigation from "../components/shared/Navigation";

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navigation />
      <main className="w-full min-h-screen py-8">{children}</main>
    </div>
  );
}
