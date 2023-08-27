export type Post = {
  date: string
  title: string
  description: string
  url: string
  platform: { name: string; icon: string; url: string }
  collaborators?:
    | { name: string; url: string; avatar: string }
    | ({ name: string; avatar: string; url: string } | undefined)[]
    | undefined
}
