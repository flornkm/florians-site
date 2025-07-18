import { useConfig } from "vike-react/useConfig";
import type { PageContextServer } from "vike/types";
import { convertMarkdownToHtml, returnContent } from "../../../markdown/convert";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
  // https://vike.dev/useConfig
  const config = useConfig();

  const projects = await returnContent("work");
  const project = projects.find((project) => project.slug === pageContext.routeParams.id);

  if (!project) {
    throw new Error(`Project with ID ${pageContext.routeParams.id} not found`);
  }

  // Update the type to include all properties from the markdown frontmatter
  type ProjectType = typeof project & {
    title: string;
    description: string;
    cover: string;
    collaborators: string | string[];
    links: string | string[];
    date: string;
  };

  const typedProject = project as ProjectType;

  // Only split if the properties are strings
  if (typeof typedProject.collaborators === "string") {
    typedProject.collaborators = typedProject.collaborators
      .split(",")
      .map((item) => (item.trim().startsWith(" ") ? item.trim().substring(1) : item.trim()));
  }

  if (typeof typedProject.links === "string") {
    typedProject.links = typedProject.links
      .split(",")
      .map((item) => (item.trim().startsWith(" ") ? item.trim().substring(1) : item.trim()));
  }

  config({
    title: typedProject.title,
    description: typedProject.description,
  });

  // Convert the markdown to html
  const html = await convertMarkdownToHtml(`/work/${typedProject.slug}`);

  if (!html) {
    throw new Error(`Failed to convert markdown to html for project ${typedProject.slug}`);
  }

  return {
    title: typedProject.title,
    description: typedProject.description,
    collaborators: typedProject.collaborators,
    links: typedProject.links,
    date: typedProject.date,
    html: html as string,
  };
};
