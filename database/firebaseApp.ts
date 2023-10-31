import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  databaseURL: import.meta.env.FIREBASE_DATABASE_URL,
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
