import { getContent, getContentMeta, isBlogEntry, type BlogEntry, type Heading } from "@/lib/mdx";
import { useConfig } from "vike-react/useConfig";
import type { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
  const config = useConfig();
  const posts = await getContent("blog");
  const postRaw = posts.find((p) => p.slug === pageContext.routeParams.id);

  if (!postRaw) {
    throw new Error(`Blog post with ID ${pageContext.routeParams.id} not found`);
  }

  if (!isBlogEntry(postRaw)) {
    throw new Error(`Blog post ${pageContext.routeParams.id} is missing required fields`);
  }

  const post: BlogEntry = postRaw;

  config({
    title: `${post.title} • Florian - Design Engineer`,
    description: post.description,
    image: `/api/og?title=${post.title}`,
  });

  const meta = await getContentMeta("blog", post.slug);
  const headings: Heading[] = meta?.headings ?? [];

  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    headings,
  };
};
