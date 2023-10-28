export const documentProps = {
  title: "Florian's Feed",
}

export default function Page({ posts }: { posts: any[] }) {
  console.log(posts)
  return (
    <div class="w-full">
      <section class="w-full lg:pt-16">
        <h1 class="text-3xl font-semibold mb-4">Feed</h1>
        <p class="text-zinc-500 mb-16 max-w-lg">Lorem Ipsum…</p>
        <div class="py-0.5 pb-16">
          {posts.map((post: any) => {
            return <div>{post.slug}</div>
          })}
        </div>
      </section>
    </div>
  )
}
