import { returnContent } from "@/markdown/convert";
import { PageContextServer } from "vike/types";

export const data = async (_pageContext: PageContextServer) => {
  const projects = await returnContent("work");
  return projects;
};
