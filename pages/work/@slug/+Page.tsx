import { usePageContext } from "../../../renderer/usePageContext"

export const documentProps = {
  title: "Florian's Feed",
}

export default function Page({
  content,
}: {
  content: Awaited<ReturnType<any>>
}) {
  console.log(content)

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }}></div>
    </>
  )
}
