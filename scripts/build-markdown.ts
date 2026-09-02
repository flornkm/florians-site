// Emits src/markdownMap.gen.ts: a markdown variant of every page, served to agents
// that ask for `Accept: text/markdown` (see server/middleware/markdown.ts). List-like
// pages are derived from the same data modules the routes render (projects, contacts,
// writing frontmatter), so they never drift; the few prose pages mirror the visible
// copy and need a manual sync when that copy changes. Runs as part of `bun run build`.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CONTACTS } from "../src/const/contacts";
import { PROJECTS } from "../src/features/work/projects";
import { SITE_URL } from "../src/lib/site";

const ROOT = path.resolve(import.meta.dirname!, "..");
const OUTPUT_PATH = path.join(ROOT, "src/markdownMap.gen.ts");

type Page = { title: string; markdown: string };
const pages: Record<string, Page> = {};

const page = (route: string, title: string, body: string) => {
  const markdown = `${body.trim()}\n\n---\n\nCanonical: ${SITE_URL}${route === "/" ? "" : route}\nMore for agents: ${SITE_URL}/llms.txt\n`;
  pages[route] = { title, markdown };
};

// ---- Home -------------------------------------------------------------------

const projectLine = (p: (typeof PROJECTS)[number]) => {
  const parts = [`### ${p.name} (${p.date})`];
  if (p.description) parts.push(`\n${p.description}`);
  if (p.url) parts.push(`\nWebsite: ${p.url}`);
  return parts.join("");
};

page(
  "/",
  "Work ‹ Florian Kiem",
  `# Florian Kiem — Designs and codes software products. Invests in a few.

I am Florian Kiem, a design engineer building software products in the intersection of design and code. This page shows selected work: interface design, design systems, motion, and front-end engineering. The visual version presents each project through screenshots and short clips.

## Selected work

${PROJECTS.map(projectLine).join("\n\n")}

## More

- [About](${SITE_URL}/about)
- [Writing](${SITE_URL}/writing)
- [Contact](${SITE_URL}/contact)
- [Experiments](${SITE_URL}/experiments)
- [Tools](${SITE_URL}/tools)
- [Colophon](${SITE_URL}/colophon)`,
);

// ---- About (mirrors the copy in src/routes/about.tsx) -----------------------

page(
  "/about",
  "About ‹ Florian Kiem",
  `# About Florian Kiem

Florian Kiem — Designer, Engineer.

Born in the south of Germany, I grew up with the Internet. In my childhood, I tried a bunch of different disciplines, ranging from 3D art to graphic design.

After studying product design, my day-to-day work evolved into something different. Pure Figma designs aren't enough, so I see my value in developing foundational design systems hands-on.

In the past, I've worked with companies like Rogo, Superpower, and Dash0. I also invest in some of the companies I work with.

Reach me on [X](https://x.com/flornkm) or via [email](mailto:hello@floriankiem.com).`,
);

// ---- Contact (mirrors src/routes/contact.tsx) -------------------------------

const contactLines = CONTACTS.map(
  (c) => `- ${c.name}${c.handle ? ` (${c.handle})` : ""}: ${c.href}`,
).join("\n");

page(
  "/contact",
  "Contact ‹ Florian Kiem",
  `# Contact Florian Kiem

The fastest way to reach me is email: hello@floriankiem.com. I read everything that lands there — questions about my work, advisory or embedded design-engineering collaborations, or just a hello.

If you are writing about a project, a short note on what you are building and where design or engineering help is needed makes it easy for me to respond quickly. I usually reply within a few days.

## Elsewhere

${contactLines}

I am Florian Kiem, a design engineer building software products — currently based in Dubai, working with teams worldwide. Postal details are on the [imprint](${SITE_URL}/imprint) page.`,
);

// ---- Experiments (titles parsed from the route's experiment() calls) --------

const experimentsSource = fs.readFileSync(path.join(ROOT, "src/routes/experiments.tsx"), "utf8");
const experiments = [
  ...experimentsSource.matchAll(/experiment\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g),
].map(([, slug, title, tag]) => ({ slug, title, tag }));

page(
  "/experiments",
  "Experiments ‹ Florian Kiem",
  `# Experiments

A page collecting different design and code experiments. Each one is an interactive demo on the web page; a shared deep link (/experiments?demo=<slug>) opens it directly.

${experiments.map((e) => `- ${e.title} (${e.tag}) — ${SITE_URL}/experiments?demo=${e.slug}`).join("\n")}`,
);

// ---- Tools (mirrors src/routes/tools.tsx) -----------------------------------

page(
  "/tools",
  "Tools ‹ Florian Kiem",
  `# Tools

Small web tools built by Florian Kiem:

- Dither — https://dither.floriankiem.com
- Gradient Border — https://gradient-border.floriankiem.com
- Shadow — https://shadow.floriankiem.com`,
);

// ---- Colophon (mirrors src/routes/colophon.tsx highlights) ------------------

page(
  "/colophon",
  "Colophon ‹ Florian Kiem",
  `# Colophon

How this site is built.

- Tech stack: React, Vite, and TanStack Start.
- Typography: Haas Recast (sans), Wagram (serif).
- The site is open source: https://github.com/flornkm/florians-site

The full colophon on the web page also covers inspirations and credits.`,
);

// ---- Kruemel ----------------------------------------------------------------

page(
  "/kruemel",
  "Krümel ‹ Florian Kiem",
  `# Krümel

Krümel, 2013–2026. The best dog one could wish for. A photo collection remembering her.`,
);

// ---- Legal (mirrors src/routes/imprint.tsx and privacy-policy.tsx) ----------

page(
  "/imprint",
  "Imprint ‹ Florian Kiem",
  `# Imprint

Florian Kiem
IFZA Business Park, DDP
63615 - 001, Dubai
UAE

## Rights

All writing, images, code, and the design of this site are copyright Florian Kiem. Reproduction, text and data mining, and the use of any part of this site for training AI models are not permitted without written permission. Reach out via hello@floriankiem.com.`,
);

page(
  "/privacy-policy",
  "Privacy Policy ‹ Florian Kiem",
  `# Privacy Policy

This is a personal site and contains links to other websites (just as any other website). It doesn't specifically track any personal data.

Privacy requests won't be answered as this site doesn't earn revenue.`,
);

// ---- Writing (frontmatter + cleaned MDX bodies) -----------------------------

type WritingPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  body: string;
};

// Components that are page furniture rather than content — a copy button is meaningless
// to a reader who already has the markdown in hand, so it leaves no trace in the twin.
// These sit inline in a sentence, so they are cut out of the line rather than dropping it.
const CHROME_COMPONENTS = ["CopyAsMarkdown"];
const CHROME_PATTERN = new RegExp(`\\s*<(?:${CHROME_COMPONENTS.join("|")})\\b[^>]*/>`, "g");

const INTERACTIVE_NOTE = "*(Interactive content on the web page.)*";

/** Index of the last line of the JSX block opening at `start`, self-closing or not. */
function componentBlockEnd(lines: string[], start: number, name: string): number {
  if (/\/>\s*$/.test(lines[start]!)) return start;
  const closingTag = new RegExp(`^\\s*</${name}>\\s*$`);
  for (let i = start + 1; i < lines.length; i++) {
    if (/\/>\s*$/.test(lines[i]!) || /^\s*\/?>\s*$/.test(lines[i]!)) return i;
    if (closingTag.test(lines[i]!)) return i;
  }
  return start;
}

// MDX -> markdown: drop imports/exports and JSX component blocks; note where an interactive
// demo lives so agents know the web page shows more.
//
// A component's props usually run over several lines (`<Comparison\n  before=…\n/>`), so the
// whole block has to go, not just its opening line — otherwise the props land in the twin as
// raw JSX, which is noise to a reader and to an agent alike. Where a block carries an `alt`,
// that sentence is the only description of the figure anywhere in the markdown, so it stays as
// a caption under the note.
//
// Fenced code blocks pass through untouched: they are the part an agent cannot reconstruct
// from the prose, and every rule above would otherwise eat lines inside them.
function cleanMdxBody(body: string): string {
  const lines = body.split("\n");
  const out: string[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (/^\s*(import|export)\s/.test(line)) continue;

    const stripped = line.replace(CHROME_PATTERN, "");
    const component = stripped.match(/^\s*<([A-Z]\w*)/)?.[1];
    if (!component) {
      // A line that was nothing but furniture disappears; one that merely ended with some
      // keeps its sentence.
      if (stripped.trim() || !line.trim()) out.push(stripped);
      continue;
    }

    const end = componentBlockEnd(lines, i, component);
    const block = lines.slice(i, end + 1).join("\n");
    i = end;

    out.push(INTERACTIVE_NOTE);
    const alt = block.match(/\balt="([^"]+)"/)?.[1];
    if (alt) out.push("", `_${alt}_`);
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const writingDir = path.join(ROOT, "src/writing");
const posts: WritingPost[] = fs
  .readdirSync(writingDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(writingDir, e.name, "article.mdx")))
  .map((e) => {
    const raw = fs.readFileSync(path.join(writingDir, e.name, "article.mdx"), "utf8");
    const { data, content } = matter(raw);
    return {
      slug: e.name,
      title: String(data.title ?? e.name),
      description: String(data.description ?? ""),
      date: String(data.date ?? ""),
      body: cleanMdxBody(content),
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

page(
  "/writing",
  "Writing ‹ Florian Kiem",
  `# Writing

Notes, essays, and live experiments by Florian Kiem.

${posts
  .map(
    (p) =>
      `- [${p.title}](${SITE_URL}/writing/${p.slug})${p.date ? ` (${p.date})` : ""}${p.description ? ` — ${p.description}` : ""}`,
  )
  .join("\n")}`,
);

for (const post of posts) {
  page(`/writing/${post.slug}`, `${post.title} ‹ Florian Kiem`, post.body);
}

// ---- Sitemap ----------------------------------------------------------------

const routeList = [...Object.keys(pages), "/sitemap"].sort();
page(
  "/sitemap",
  "Sitemap ‹ Florian Kiem",
  `# Sitemap

Every page on this site:

${routeList.map((p) => `- ${SITE_URL}${p === "/" ? "" : p}`).join("\n")}

Machine-readable version: ${SITE_URL}/sitemap.xml`,
);

// ---- Emit -------------------------------------------------------------------

const header = `// Generated by scripts/build-markdown.ts — do not edit by hand.
// Markdown variants of every page, served via \`Accept: text/markdown\`.
export interface MarkdownPage {
  title: string;
  markdown: string;
}

export const markdownPages: Record<string, MarkdownPage> = `;

fs.writeFileSync(OUTPUT_PATH, header + JSON.stringify(pages, null, 2) + ";\n");
console.log(`markdownMap.gen.ts: ${Object.keys(pages).length} pages`);
