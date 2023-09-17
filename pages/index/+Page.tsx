import { PageContextCustom } from "../../renderer/types"

export const documentProps = {
  title: "Florian - Design Engineer",
  slug: "Design Engineer",
  description: "Florians Personal Website.",
} as PageContextCustom["documentProps"]

export default function Page() {
  return (
    <div class="min-h-screen w-full">
      <h1 class="text-4xl font-semibold text-center py-96">Florian</h1>
    </div>
  )
}
