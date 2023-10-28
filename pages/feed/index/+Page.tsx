import "#design-system/markdown.css"

export const documentProps = {
  title: "Florian's Feed",
}

export default function Page({ posts, content }) {
  return (
    <div class="w-full">
      <section class="w-full lg:pt-16">
        <h1 class="text-3xl font-semibold mb-4">Feed</h1>
        <p class="text-zinc-500 mb-16 max-w-lg">Lorem Ipsum…</p>
        <div class="py-0.5 pb-16">
          {posts.map((post: any) => {
            return (
              <article>
                <h3>{post.title}</h3>
                <div
                  dangerouslySetInnerHTML={{ __html: content[post.slug] }}
                ></div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
