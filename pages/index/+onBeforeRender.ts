export default onBeforeRender

import { initializeApp } from "firebase/app"
import { returnContent } from "../../markdown/convert"
import { addDoc, collection, getFirestore } from "firebase/firestore"

// export const firebaseApp = initializeApp({
//   apiKey: import.meta.env.FIREBASE_API,
//   authDomain: import.meta.env.FIREBASE_DOMAIN,
//   projectId: import.meta.env.FIREBASE_ID,
// })

// export const db = getFirestore(firebaseApp)

async function onBeforeRender() {
  const projects = await returnContent("work")

  // try {
  //   const docRef = await addDoc(collection(db, "users"), {
  //     first: "Ada",
  //     last: "Lovelace",
  //     born: 1815,
  //   })
  //   console.log("Document written with ID: ", docRef.id)
  // } catch (e) {
  //   console.error("Error adding document: ", e)
  // }

  return {
    pageContext: {
      pageProps: {
        projects: projects,
      },
    },
  }
}
