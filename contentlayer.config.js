import { defineDocumentType, makeSource } from "contentlayer/source-files"

const Project = defineDocumentType(() => ({
  name: "Project",
  filePathPattern: `projects/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    date: {
      type: "string",
      required: true,
    },
    shortDescription: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: true,
    },
    collaborators: {
      type: "list",
      of: { type: "string" },
      required: false,
    },
    preview: {
      type: "string",
      required: true,
    },
    banner: {
      type: "string",
      required: true,
    },
    tags: {
      type: "list",
      of: { type: "string" },
      required: true,
    },
    slideImages: {
      type: "list",
      of: { type: "string" },
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx/, ""),
    },
  },
}))

const Entry = defineDocumentType(() => ({
  name: "Entry",
  filePathPattern: `entries/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    date: {
      type: "string",
      required: true,
    },
    image: {
      type: "string",
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx/, ""),
    },
  },
}))

export default makeSource({
  contentDirPath: "./src/content",
  contentDirExcludePatterns: ["**/creations/**/*", "**/README.md"],
  documentTypes: [Project, Entry],
})
