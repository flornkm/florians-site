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
      <FileSystem>
        <div class="w-full gap-4 items-start grid xl:grid-cols-5 md:grid-cols-3 xs:grid-cols-2">
          <a
            href="/archive"
            class="p-4 transition-colors hover:bg-neutral-200 rounded-lg flex items-center justify-center"
          >
            <div class="flex flex-col items-center gap-2 w-28">
              <FolderIllustration />
              <p class="font-medium text-center">..</p>
            </div>
          </a>
          {Vectorfiles.map((file) => {
            return (
              <Item fileData={file.data}>
                <div class="w-full flex flex-col h-32 items-start justify-center gap-4 p-4 relative z-10">
                  <div
                    class="mx-auto w-full h-full overflow-hidden flex items-center p-4 justify-center border border-neutral-200"
                    dangerouslySetInnerHTML={{ __html: file.data }}
                  />
                  {/* <p class="font-medium w-full text-center">
                    <span class="md:truncate">
                      {file.name.toLowerCase().replaceAll(" ", "_")}.svg
                    </span>
                  </p>
                  {file.source && (
                    <div class="w-full" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="text"
                        link={file.source}
                        class="text-neutral-500 text-sm mx-auto"
                      >
                        Source
                      </Button>
                    </div>
                  )} */}
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
    <div
      onClick={() => {
        navigator.clipboard.writeText(props.fileData)
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 1000)
      }}
      class="w-auto bg-neutral-100 dark:bg-neutral-900 relative transition-colors rounded-lg cursor-pointer hover:bg-neutral-200"
    >
      {copied && (
        <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 right-0 p-2 bg-white shadow-md dark:bg-neutral-800 dark:shadow-lg rounded-lg text-center">
          Copied!
        </p>
      )}
      {props.children}
    </div>
  )
}
