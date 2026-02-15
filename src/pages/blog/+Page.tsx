import { Body2 } from "@/components/design-system/body";
import { H1, H3 } from "@/components/design-system/heading";
import Section from "@/components/shared/section";
import { Link } from "@/components/ui/link";
import { usePageContext } from "vike-react/usePageContext";

export default function Page() {
  const pageContext = usePageContext();

  const posts = pageContext.data as {
    title: string;
    description: string;
    slug: string;
    date: string;
  }[];

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-0">
        <Section className="mb-12">
          <H1>Blog</H1>
          <div />
        </Section>
        <section className="group/section flex w-full flex-col">
          {posts.map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className="group/item w-full border-b border-primary py-5 transition-opacity duration-300 ease-out first:border-t hover:opacity-100 group-hover/section:opacity-30"
            >
              <div className="flex w-full items-baseline justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <H3>{post.title}</H3>
                  <Body2 className="text-tertiary">{post.description}</Body2>
                </div>
                <span className="shrink-0 text-sm text-quaternary">{post.date}</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
