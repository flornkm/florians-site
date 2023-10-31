export default onBeforeRender

import { returnContent } from "../../markdown/convert"
import { Letter } from "#sections/Letters"
import { PageContextCustom } from "renderer/types"
import { database } from "#database/firebaseApp"
import { get, limitToLast, query, ref, set } from "firebase/database"

async function onBeforeRender() {
  const projects = await returnContent("work")
  let letters: Record<string, Letter> = {}

  try {
    const lastLetters = query(ref(database, "letters"), limitToLast(3))
    letters = await (await get(lastLetters)).val()

    letters = Object.fromEntries(
      Object.entries(letters).filter(([, value]) => value !== undefined)
    )
  } catch (error) {
    console.error("Error updating score:", error)
  }

  return {
    pageContext: {
      pageProps: {
        letters: letters,
        projects: projects,
      },
      documentProps: {
        title: "Florian - Design Engineer",
        description: "A designer and developer building digital products.",
      } satisfies PageContextCustom["exports"]["documentProps"],
    },
  }
}
