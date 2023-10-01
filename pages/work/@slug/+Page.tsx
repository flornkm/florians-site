import { usePageContext } from "../../../renderer/usePageContext"

export const documentProps = {
  title: "Florian's Project",
}

export default function Page(props: Record<string, string>) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: props.content }}></div>
    </>
  )
}
