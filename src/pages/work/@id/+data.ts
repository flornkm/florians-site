import { convertMarkdownToHtml, isWorkEntry, returnContent, type WorkEntry } from "@/lib/convert";
import { useConfig } from "vike-react/useConfig";
import type { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
  // https://vike.dev/useConfig
  const config = useConfig();

  const projects = await returnContent("work");

  const projectRaw = projects.find((p) => p.slug === pageContext.routeParams.id);

  if (!projectRaw) {
    throw new Error(`Project with ID ${pageContext.routeParams.id} not found`);
  }

  if (!isWorkEntry(projectRaw)) {
    throw new Error(`Project ${pageContext.routeParams.id} is missing required fields`);
  }

  const project: WorkEntry = projectRaw;

  // Only split if the properties are strings, otherwise set defaults
  if (typeof project.collaborators === "string") {
    project.collaborators = project.collaborators
      .split(",")
      .map((item: string) => (item.trim().startsWith(" ") ? item.trim().substring(1) : item.trim()));
  } else if (!project.collaborators) {
    project.collaborators = [];
  }

  if (typeof project.links === "string") {
    project.links = project.links
      .split(",")
      .map((item: string) => (item.trim().startsWith(" ") ? item.trim().substring(1) : item.trim()));
  } else if (!project.links) {
    project.links = [];
  }

  config({
    title: `${project.title} • Florian - Design Engineer`,
    description: project.description,
    image: `/api/og?title=${project.title}`,
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
