import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

export const firebaseApp = initializeApp({
  apiKey: import.meta.env.FIREBASE_API,
  authDomain: import.meta.env.FIREBASE_DOMAIN,
  projectId: import.meta.env.FIREBASE_ID,
})

export const db = getFirestore(firebaseApp)
