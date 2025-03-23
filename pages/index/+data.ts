import { PageContextServer } from "vike/types";
import { returnContent } from "../../markdown/convert";

export const data = async (pageContext: PageContextServer) => {
  const projects = await returnContent("work");
  return projects;
};
