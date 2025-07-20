import { useConfig } from "vike-react/useConfig";
import type { PageContextServer } from "vike/types";
import { convertMarkdownToHtml, returnContent } from "../../../markdown/convert";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
  // https://vike.dev/useConfig
  const config = useConfig();

  const projects = await returnContent("work");

  const project = projects.find((project) => project.slug === pageContext.routeParams.id) as typeof project & {
    title: string;
    description: string;
    cover: string;
    collaborators: string | string[];
    links: string | string[];
    date: string;
  };

  if (!project) {
    throw new Error(`Project with ID ${pageContext.routeParams.id} not found`);
  }

  // Only split if the properties are strings, otherwise set defaults
  if (typeof project.collaborators === "string") {
    project.collaborators = project.collaborators
      .split(",")
      .map((item) => (item.trim().startsWith(" ") ? item.trim().substring(1) : item.trim()));
  } else if (!project.collaborators) {
    project.collaborators = [];
  }

  if (typeof project.links === "string") {
    project.links = project.links
      .split(",")
      .map((item) => (item.trim().startsWith(" ") ? item.trim().substring(1) : item.trim()));
  } else if (!project.links) {
    project.links = [];
  }

  config({
    title: project.title,
    description: project.description,
  });

  // Convert the markdown to html
  const html = await convertMarkdownToHtml(`/work/${project.slug}`);

  if (!html) {
    throw new Error(`Failed to convert markdown to html for project ${project.slug}`);
  }

  return {
    title: project.title,
    description: project.description,
    collaborators: project.collaborators,
    links: project.links,
    date: project.date,
    html: html as string,
  };
};
