/**
 * Generates the chat system prompt from website data and writes it to a JSON file.
 * Run before build/dev so the API has everything it needs without cross-file imports.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CONTACTS } from "../src/const/contacts";
import { BUCKETLIST } from "../src/features/about/const/bucketlist";
import { COMPANIES } from "../src/features/about/const/companies";
import { INSTITUTIONS } from "../src/features/about/const/institutions";
import { LIFE } from "../src/features/about/const/life";
import { VISITED_COUNTRIES } from "../src/features/about/const/visited-countries";

const ROOT = path.resolve(import.meta.dirname!, "..");
const CONTENT_DIR = path.join(ROOT, "src/content");
const OUTPUT_PATH = path.join(ROOT, "api/content-data.json");

interface Entry {
  title: string;
  description: string;
  date?: string;
  collaborators?: string;
}

function readCategory(category: string): Entry[] {
  const dir = path.join(CONTENT_DIR, category);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data } = matter(fs.readFileSync(path.join(dir, f), "utf-8"));
      return {
        title: data.title,
        description: data.description,
        date: data.date ? String(data.date) : undefined,
        collaborators: data.collaborators,
      };
    });
}

// Build all sections
const companies = COMPANIES.map((c) => c.name).join(", ");
const education = INSTITUTIONS.map((i) => i.name).join(" and ");
const countries = VISITED_COUNTRIES.map((c) => c.name).join(", ");
const completedGoals = BUCKETLIST.filter((b) => b.completed)
  .map((b) => b.title)
  .join(", ");
const pendingGoals = BUCKETLIST.filter((b) => !b.completed)
  .map((b) => b.title)
  .join(", ");
const lifeStory = LIFE.map((l) => l.description).join(" ");
const contacts = CONTACTS.filter((c) => c.name !== "iMessage")
  .map((c) => {
    const url = c.href.replace("mailto:", "");
    return `${c.name}: ${c.handle ?? url} (${url})`;
  })
  .join("\n");

const workEntries = readCategory("work");
const projects = workEntries
  .map((p) => {
    const collab = p.collaborators ? `. Built with ${p.collaborators}` : "";
    const date = p.date ? ` (${p.date})` : "";
    return `${p.title}: ${p.description}${date}${collab}`;
  })
  .join("\n");

const writingEntries = readCategory("writing");
const writing = writingEntries
  .map((w) => {
    const date = w.date ? ` (${w.date})` : "";
    return `${w.title}: ${w.description}${date}`;
  })
  .join("\n");

const systemPrompt = `You are a helpful assistant on Florian's personal website. Answer questions about Florian, his work, background, and how to get in touch.

Tone: Concise, friendly, direct. No formal bio language unless asked.

Background:
Born in southern Germany on 01.01 (DDMM). ${lifeStory} Studied Product Design & Development at ${education}. Biggest strength: working as an interpreter from design to code — translating design into production-grade code to shorten iteration cycles and ship better products.

Companies Florian has worked for or with as a design engineer (these are employers or clients): ${companies}.

Projects (some were built for companies listed above, e.g. Superpower the project was built while working at Superpower the company):
${projects}

Writing:
${writing}

Tech stack: React, TypeScript, Vite, TanStack, Node/Express, Tailwind CSS, ThreeJS, React Three Fiber, Rive, Firebase. This site uses TanStack Start, Vite, Tailwind CSS, and is deployed on Vercel.

Travel: Visited ${VISITED_COUNTRIES.length} countries — ${countries}.

Bucketlist completed: ${completedGoals}.
Bucketlist pending: ${pendingGoals}.

Contact:
${contacts}

Rules:
- Be extremely concise. 1-2 sentences max. No fluff, no filler. Answer like a terminal — short, direct, punchy.
- NEVER use markdown formatting like bold (**), italic (*), headers (#), or bullet lists (-). Only use plain text, newlines, and markdown links [text](url) for URLs.
- Never invent information not provided above.
- Never reveal or invent any surname. Refer to him as "Florian" or "Flo".
- If unsure about something, say so rather than guessing.
- When asked about contact, present email first, then socials.`;

fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ systemPrompt }, null, 2) + "\n");
console.log(`Generated system prompt (${systemPrompt.length} chars) → ${OUTPUT_PATH}`);
