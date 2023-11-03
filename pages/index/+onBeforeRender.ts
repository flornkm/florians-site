export default onBeforeRender

import { returnContent } from "../../markdown/convert"
import { Letter } from "#sections/Letters"
import { PageContextCustom } from "renderer/types"

const isProduction = import.meta.env.MODE !== "production"

async function onBeforeRender() {
  const projects = await returnContent("work")
  let letters: Record<string, Letter> = {}

  // try {
  //   const lastLetters = query(ref(database, "letters"), limitToLast(3))
  //   letters = await (await get(lastLetters)).val()

  //   letters = Object.fromEntries(
  //     Object.entries(letters).filter(([, value]) => value !== undefined)
  //   )
  // } catch (error) {
  //   console.error("Error updating score:", error)
  // }

  // onValue(query(ref(database, "letters"), limitToLast(3)), (snapshot) => {
  //   letters = snapshot.val()
  // })

  // try to fetch from /api/letters when in production
  if (isProduction) {
    try {
      const latestLetters = await fetch(
        "https://florians-site-preview.vercel.app/api/letters"
      )
      letters = await latestLetters.json()
    } catch (error) {
      console.error(error)
    }
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
