import { getContent } from "@/lib/mdx";
import { PageContextServer } from "vike/types";

export const data = async (_pageContext: PageContextServer) => {
  const items = await getContent("writing");
  return items;
};
