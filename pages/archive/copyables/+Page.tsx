import Button from "#components/Button"
import Vectorfiles from "./assets/vectorfiles.json"
import { useState } from "preact/hooks"
import README from "#components/README"
import { FolderIllustration } from "#design-system/Vectors"
import FileSystem from "#sections/FileSystem"

/* How to add a new vector file:
1. Copy the SVG file
2. Go to https://onlinetexttools.com/replace-text and replace " with '
3. Go to https://lingojam.com/TexttoOneLine and convert the SVG to one line
4. Add the file to the vectorfiles.json file inside of the assets folder
*/

Vectorfiles.reverse()

export default function Page() {
  return (
    <div class="w-full">
      <FileSystem items={{ amount: Vectorfiles.length, label: "items" }}>
        <div class="w-full gap-4 items-start grid xl:grid-cols-5 md:grid-cols-3 xs:grid-cols-2">
          <button
            onClick={(e) => {
              if (
                e.detail === 1 &&
                typeof window !== "undefined" &&
                window.innerWidth > 768
              )
                e.preventDefault()
              else window.location.href = "/archive"
            }}
            className="p-4 relative rounded-lg flex items-center justify-center group cursor-default active:scale-95 transition-transform duration-75"
          >
            <div className="flex flex-col items-center gap-2 w-28">
              <div class="text-neutral-400 relative dark:text-neutral-500">
                <FolderIllustration />
              </div>
              <p className="font-medium text-center text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors duration-75">
                ..
              </p>
            </div>
          </button>
          {Vectorfiles.map((file) => {
            return (
              <Item fileData={file.data}>
                <div class="w-full flex flex-col h-32 items-start justify-center gap-4 relative z-10">
                  <div
                    class="mx-auto w-full h-full overflow-hidden flex items-center p-8 justify-center border border-neutral-200 dark:border-neutral-800"
                    dangerouslySetInnerHTML={{ __html: file.data }}
                  />
                </div>
              </Item>
            )
          })}
        </div>
      </FileSystem>
    </div>
  )
}

function Item(props: { fileData: string; children: any }) {
  const [copied, setCopied] = useState(false)

  return (
    <>
      <div class="relative">
        {copied && (
          <p class="absolute inset-0 flex items-center justify-center bg-neutral-200 dark:bg-neutral-900 z-20">
            Copied!
          </p>
        )}
        <div
          onClick={() => {
            navigator.clipboard.writeText(props.fileData)
            setCopied(true)
            setTimeout(() => {
              setCopied(false)
            }, 1000)
          }}
          class="w-auto transition-opacity rounded-lg cursor-context-menu hover:opacity-75"
        >
          {props.children}
        </div>
      </div>
    </>
  )
}
