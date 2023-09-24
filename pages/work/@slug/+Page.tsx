import { usePageContext } from "../../../renderer/usePageContext"

export const documentProps = {
  title: "Florian's Feed",
}

export default function Page(pageProps: any) {
  console.log(pageProps)

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: pageProps.content }}></div>
    </>
  )
}
