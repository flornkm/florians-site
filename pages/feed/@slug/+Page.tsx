import "#design-system/feed.css"

export default function Page(props: Record<string, string>) {
  return (
    <>
      <article class="lg:py-16 pb-16 max-w-lg mx-auto">
        <div dangerouslySetInnerHTML={{ __html: props.content }}></div>
      </article>
    </>
  )
}
