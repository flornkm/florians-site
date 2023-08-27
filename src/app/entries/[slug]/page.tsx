import { redirect } from "next/navigation"

type EntryParams = {
  slug: string
}

export default async function Entry({
  params: { slug },
}: {
  params: EntryParams
}) {
  redirect("/blog/" + slug)
}
