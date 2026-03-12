/**
 * Remark plugin that exports the raw markdown body (without frontmatter)
 * as a named export `rawContent` from the compiled MDX module.
 */
export function remarkRawContent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any, file: any) => {
    const raw = String(file.value);
    // Strip frontmatter
    const match = raw.match(/^---[\s\S]*?---\s*/);
    const content = match ? raw.slice(match[0].length) : raw;

    // Inject: export const rawContent = "..."
    tree.children.push({
      type: "mdxjsEsm",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              specifiers: [],
              source: null,
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "rawContent" },
                    init: { type: "Literal", value: content },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}
