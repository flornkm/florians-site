export interface RenderedProjects {
  [slug: string]: ProjectContent
}

export type Project = {
  title: string
  slug: string
  date: string
}

export type ProjectContent = {
  [key: string]: string
}
