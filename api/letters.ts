import type { VercelRequest, VercelResponse } from "@vercel/node";

import { db } from "./utils/_firebase.js";
import { openai } from "./utils/_openai.js";

const ref = db.ref("letters");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const snapshot = await ref.limitToLast(3).once("value");
      const letters = snapshot.val() || {};

      res.statusCode = 200;
      res.json({
        letters,
        message: "Letters fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching letters.", error);
      res.statusCode = 500;
      res.json({ error: "Failed to fetch letters" });
    }
  } else if (req.method === "POST") {
    const { email, message, signature, handle } = req.body;

    if (message.length >= 102) {
      res.statusCode = 400;
      res.end();
      return;
    }

    const moderation = await openai.moderations.create({ input: message });

    if (moderation.results[0].flagged) {
      res.statusCode = 400;
      res.json({ error: "Flagged content" });
      return;
    }

    try {
      const letterData = {
        email,
        message,
        signature,
        handle,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
      };

      await ref.push(letterData);

      res.statusCode = 200;
      res.json({ success: true, message: "Letter saved successfully" });
    } catch (error) {
      console.error("Error saving letter:", error);
      res.statusCode = 500;
      res.json({ error: "Failed to save letter" });
    }
  }
}
