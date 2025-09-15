import { readdir, readFile } from "fs/promises";
import { marked, Token } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

const modelExtension = {
  name: "model",
  level: "inline" as const,
  start(src: string) {
    return src.indexOf("[@model:");
  },
  tokenizer(src: string) {
    const rule = /^\[@model:([^\]]+)\]/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: "model",
        raw: match[0],
        src: match[1].trim(),
      };
    }
  },
  renderer(token: Token & { src: string }) {
    return `<div class="model-viewer" data-src="${token.src}"></div>`;
  },
};

const videoExtension = {
  name: "video",
  level: "inline" as const,
  start(src: string) {
    return src.indexOf("[@video:");
  },
  tokenizer(src: string) {
    const rule = /^\[@video:([^\]]+)\]/;
    const match = rule.exec(src);
    if (match) {
      const params = match[1].trim();
      const [src, ...options] = params.split("|");

      const parsedOptions: Record<string, string | boolean> = {};
      options.forEach((option) => {
        const trimmed = option.trim();
        // Handle class="" syntax
        const classMatch = trimmed.match(/^class="([^"]*)"$/);
        if (classMatch) {
          parsedOptions.className = classMatch[1];
        } else if (trimmed.includes(":")) {
          const [key, value] = trimmed.split(":");
          parsedOptions[key] = value;
        } else {
          parsedOptions[trimmed] = true;
        }
      });

      return {
        type: "video",
        raw: match[0],
        src: src.trim(),
        options: parsedOptions,
      };
    }
  },
  renderer(token: Token & { src: string; options: Record<string, string | boolean> }) {
    const optionsJson = JSON.stringify(token.options).replace(/"/g, "&quot;");
    return `<div class="video-player" data-src="${token.src}" data-options="${optionsJson}"></div>`;
  },
};

export async function convertMarkdownToHtml(url: string): Promise<string | boolean> {
  const contentRoot = "./src/content";

  const markdown = await readFile(`${contentRoot}${url}.md`, "utf-8");

  marked.use(
    gfmHeadingId({
      prefix: "flornkm-work-",
    }),
    {
      extensions: [modelExtension, videoExtension],
    },
  );

  const convertedHTML = marked(
    deleteInfo(markdown + '\n <base target="_blank">', markdown.match(/---(.*?)---/s)![1].split("\n").length),
  );

  return convertedHTML;
}

export type ContentEntry = {
  slug: string;
  url: string;
  short: boolean;
} & Record<string, string | boolean>;

export type WorkEntry = ContentEntry & {
  title: string;
  description: string;
  cover: string;
  date: string;
  collaborators?: string | string[];
  links?: string | string[];
};

export type CollectionEntry = ContentEntry & {
  title: string;
  description: string;
  type: string;
  collaborators?: string | string[];
};

export function isWorkEntry(entry: ContentEntry): entry is WorkEntry {
  return (
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.cover === "string" &&
    typeof entry.date === "string"
  );
}

export function isCollectionEntry(entry: ContentEntry): entry is CollectionEntry {
  return typeof entry.title === "string" && typeof entry.description === "string" && typeof entry.type === "string";
}

export async function returnContent(category: "work" | "collection"): Promise<ContentEntry[]> {
  const contentRoot = "./src/content/" + category;
  const tableOfContents: ContentEntry[] = [];

  const files = await readdir(contentRoot);

  for (const file of files) {
    const markdown = await readFile(`${contentRoot}/${file}`, "utf-8");
    const properties = markdown.match(/---(.*?)---/s)![1].split("\n");

    const projectInfo: Record<string, string> = {};
    for (const property of properties) {
      if (property === "") continue;
      const key = property.split(": ")[0];
      const value = property.split(": ")[1];
      projectInfo[key] = value;
    }

    tableOfContents.push({
      ...projectInfo,
      slug: file.replace(".md", ""),
      url: `/${category}/${file.replace(".md", "")}`,
      short: markdown.length < 2000,
    });
  }

  tableOfContents.sort(
    (a, b) =>
      // @ts-expect-error - This is a hack to get the project info
      new Date(b.date.split("/")[1], b.date.split("/")[0]).getTime() -
      // @ts-expect-error - This is a hack to get the project info
      new Date(a.date.split("/")[1], a.date.split("/")[0]).getTime(),
  );

  return tableOfContents;
}

function deleteInfo(string: string, n: number) {
  return string.replace(new RegExp(`(?:.*?\n){${n - 1}}(?:.*?\n)`), "");
}
