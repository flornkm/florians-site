import "#design-system/markdown.css"
import Markdown from "#markdown/Markdown"

export default function Page(props: Record<string, string>) {
  return (
    <>
      <Markdown class="lg:py-16 pb-16" content={props.content} />
    </>
  )
}
