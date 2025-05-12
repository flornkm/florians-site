import { PageContextServer } from "vike/types";
import { returnContent } from "../../markdown/convert";

export const data = async (_pageContext: PageContextServer) => {
  const items = await returnContent("timeline");
  return items;
};
