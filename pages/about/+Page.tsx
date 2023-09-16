export default Page

import PageLayout from "../../layouts/PageLayout"

export const documentProps = {
  title: "About Florian",
}

function Page() {
  return (
    <>
      <h1>About</h1>
      <p>
        Demo using <code>vite-plugin-ssr</code>.
      </p>
    </>
  )
}
