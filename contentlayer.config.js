import { defineDocumentType, makeSource } from "contentlayer/source-files"

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
  documentTypes: [Entry],
})
