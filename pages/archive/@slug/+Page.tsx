import "#design-system/markdown.css"

export const config = {
  title: "Florian's Project",
}

export default function Page(props: Record<string, string>) {
  return (
    <>
      <article class="lg:py-16 pb-16">
        <div dangerouslySetInnerHTML={{ __html: props.content }}></div>
      </article>
    </>
  )
}
