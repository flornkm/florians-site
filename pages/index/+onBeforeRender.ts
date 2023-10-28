export default onBeforeRender

import { initializeApp } from "firebase/app"
import { returnContent } from "../../markdown/convert"
import { collection, addDoc, getFirestore, getDocs } from "firebase/firestore"
import { Letter } from "../../interface/components/Letters"

async function onBeforeRender() {
  const projects = await returnContent("work")

  // const firebaseApp = initializeApp({
  //   apiKey: import.meta.env.FIREBASE_API,
  //   authDomain: import.meta.env.FIREBASE_DOMAIN,
  //   projectId: import.meta.env.FIREBASE_ID,
  // })

  // const db = getFirestore(firebaseApp)

  // const letters = await getDocs(collection(db, "letters"))

  const letters = [
    {
      text: "test",
      signature: "/images/letter/signature.png",
      handle: "@floriandwt",
    },
    {
      text: "test",
      signature: "/images/letter/signature.png",
      handle: "@floriandwt",
    },
    {
      text: "test",
      signature: "/images/letter/signature.png",
      handle: "@floriandwt",
    },
  ]

  return {
    pageContext: {
      pageProps: {
        letters: letters.docs
          ? letters.docs.map((letter) => letter.data())
          : letters,
        projects: projects,
      },
    },
  }
}
