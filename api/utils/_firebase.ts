import admin from "firebase-admin";

if (!admin || !admin.credential) {
  throw new Error("Firebase Admin SDK not properly loaded");
}

if (!admin.apps || !admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_ADMIN_CERT) {
    try {
      const cert = JSON.parse(process.env.FIREBASE_ADMIN_CERT);
      credential = admin.credential.cert(cert);
    } catch (error) {
      console.error("JSON parse error:", error);
      throw new Error(
        `Invalid FIREBASE_ADMIN_CERT JSON format: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });
  } else {
    throw new Error(
      "Firebase Admin credentials not found. Please set FIREBASE_ADMIN_CERT or individual Firebase environment variables.",
    );
  }

  admin.initializeApp({
    credential,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export const db = admin.database();
