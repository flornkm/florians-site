export default onBeforeRender

import { initializeApp } from "firebase/app"
import { returnContent } from "../../markdown/convert"
import { collection, addDoc, getFirestore, getDocs } from "firebase/firestore"
import { Letter } from "#sections/Letters"
import { PageContextCustom } from "renderer/types"

async function onBeforeRender() {
  const projects = await returnContent("work")

  const letters = [
    {
      text: `Consectetur consectetur Lorem minim aute quis amet elit cillum adipisicing elit tempor ut incididunt. Adipisicing velit ullamco ipsum mollit aliquip sint ad commodo anim. Excepteur et mollit ut irure reprehenderit magna do commodo ad. Occaecat deserunt laborum eiusmod voluptate aute duis. Adipisicing commodo adipisicing dolore est ut Lorem consectetur officia.`,
      signature: "/images/letter/signature.png",
      handle: "@floriandwt",
    },
    {
      text: `Consectetur consectetur Lorem minim aute quis amet elit cillum adipisicing elit tempor ut incididunt. Adipisicing velit ullamco ipsum mollit aliquip sint ad commodo anim. Excepteur et mollit ut irure reprehenderit magna do commodo ad. Occaecat deserunt laborum eiusmod voluptate aute duis. Adipisicing commodo adipisicing dolore est ut Lorem consectetur officia.`,
      signature: "/images/letter/signature.png",
      handle: "@nils_e13",
    },
    {
      text: `Consectetur consectetur Lorem minim aute quis amet elit cillum adipisicing elit tempor ut incididunt. Adipisicing velit ullamco ipsum mollit aliquip sint ad commodo anim. Excepteur et mollit ut irure reprehenderit magna do commodo ad. Occaecat deserunt laborum eiusmod voluptate aute duis. Adipisicing commodo adipisicing dolore est ut Lorem consectetur officia.`,
      signature: "/images/letter/signature.png",
      handle: "@stallboerger",
    },
  ]

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
