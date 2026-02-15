import { getContent } from "@/lib/mdx";
import type { PageContextServer } from "vike/types";

export const data = async (_pageContext: PageContextServer) => {
  const posts = await getContent("blog");
  return posts;
};
