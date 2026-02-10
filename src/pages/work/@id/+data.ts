import { getContent, getContentMeta, isWorkEntry, type Heading, type WorkEntry } from "@/lib/mdx";
import { useConfig } from "vike-react/useConfig";
import type { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
  const config = useConfig();
  const projects = await getContent("work");
  const projectRaw = projects.find((p) => p.slug === pageContext.routeParams.id);

  if (!projectRaw) {
    throw new Error(`Project with ID ${pageContext.routeParams.id} not found`);
  }

  if (!isWorkEntry(projectRaw)) {
    throw new Error(`Project ${pageContext.routeParams.id} is missing required fields`);
  }

  const project: WorkEntry = projectRaw;

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

  const meta = await getContentMeta("work", project.slug);
  const headings: Heading[] = meta?.headings ?? [];

  return {
    slug: project.slug,
    title: project.title,
    description: project.description,
    collaborators: project.collaborators,
    links: project.links,
    date: project.date,
    headings,
  };
};
