export interface RenderedPosts {
  [slug: string]: PostContent
}

export type Post = {
  title: string
  slug: string
  type: "writing"
  date: string
}

export type PostContent = {
  [key: string]: string
}
