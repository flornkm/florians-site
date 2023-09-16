export default Page

import PageLayout from "../../renderer/PageLayout"
import { Counter } from "./Counter"

function Page() {
  return (
    <>
      <PageLayout>
        <div>
          <h1>Welcome</h1>
          This page is:
          <ul>
            <li>Rendered to HTML.</li>
            <li>
              Interactive. <Counter />
            </li>
          </ul>
        </div>
      </PageLayout>
    </>
  )
}
