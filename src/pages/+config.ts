import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../layouts/layout-default";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,

  // https://vike.dev/head-tags
  title: "Florian - Design Engineer",
  description:
    "The personal site of Florian Kiem - a design engineer, bridging the gap between creativity and logic in this portfolio.",
  image: "/api/og?title=Florian%20-%20Design%20Engineer",

  prerender: true,
  extends: vikeReact,
} satisfies Config;
