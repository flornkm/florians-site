export default Page

import PageLayout from "../../layouts/PageLayout"
import { Counter } from "./Counter"

export const documentProps = {
  title: "Florian - Design Engineer",
}

function Page() {
  return (
    <div class="min-h-screen w-full">
      <h1 class="text-4xl font-bold text-center py-96">Florian</h1>
    </div>
  )
}
