export interface RenderedPosts {
  [slug: string]: PostContent
}

export type Post = {
  title: string
  slug: string
  date: string
}

export type PostContent = {
  [key: string]: string
}
