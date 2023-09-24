import { usePageContext } from "../../../renderer/usePageContext"

export const documentProps = {
  title: "Florian's Feed",
}

export default function Page({ content }: { content: string }) {
  console.log(content)

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }}></div>
    </>
  )
}
