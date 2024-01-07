import Button, { InlineLink } from "#components/Button"
import { SVG as File } from "#design-system/Icons"
import Vectorfiles from "./assets/vectorfiles.json"
import { useState } from "preact/hooks"
import README from "#components/README"
import { userScrolledDown } from "#hooks/userScrolledDown"

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
      <section class="w-full pb-24">
        <div
          class={
            "flex items-center lg:mt-6 mb-6  bg-light-zinc/95 backdrop-blur-xl dark:bg-black/90 sticky top-0 lg:top-14 z-50 transition-all " +
            (userScrolledDown(40)
              ? "font-medium py-2"
              : "text-3xl font-semibold lg:py-2")
          }
        >
          <InlineLink link="/archive" class="px-1.5 -ml-1.5" hideWeight>
            Archive
          </InlineLink>
          <p> / </p>
          <p class="px-1.5 text-zinc-400 dark:text-zinc-600 truncate">
            Copyables
          </p>
        </div>
        <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 w-full gap-4 h-full min-h-screen">
          <div class="py-0.5 gap-4 flex items-start flex-col h-full">
            <Item>
              <README>
                <>
                  <p class="text-zinc-500 max-w-lg dark:text-zinc-400">
                    A place for little copyable things that I've found in the
                    Internet or made myself.
                  </p>
                  {/* <p class="font-semibold font-rounded text-zinc-500 dark:text-zinc-400">
                    Yes, you can copy these and paste them directly into Figma
                    or your code editor. ;)
                  </p> */}
                </>
              </README>
            </Item>
            {Vectorfiles.filter((_, i) => i % 3 === 0).map((file) => {
              const [copied, setCopied] = useState(false)
              return (
                <Item>
                  <p class="font-medium leading-snug col-span-2 flex items-center mt-4 ml-4 mb-4 relative z-10">
                    <File class="flex-shrink-0 text-zinc-400 mr-2" size={20} />
                    <span class="md:truncate">
                      {file.name.toLowerCase().replaceAll(" ", "_")}.svg
                    </span>
                  </p>
                  <div class="w-full flex flex-col items-start justify-center gap-12 p-8 pb-4 relative z-10">
                    <div
                      class="mx-auto"
                      dangerouslySetInnerHTML={{ __html: file.data }}
                    />
                    <div class="w-full">
                      <Button
                        type="secondary"
                        small
                        class="w-full justify-center mb-4"
                        function={() => {
                          navigator.clipboard.writeText(file.data)
                          setCopied(true)
                          setTimeout(() => {
                            setCopied(false)
                          }, 1000)
                        }}
                      >
                        {copied ? "Copied!" : "Copy SVG"}
                      </Button>
                      {file.source && (
                        <Button
                          type="text"
                          link={file.source}
                          class="text-zinc-500 text-sm mx-auto"
                        >
                          Source
                        </Button>
                      )}
                    </div>
                  </div>
                </Item>
              )
            })}
          </div>
          <div class="py-0.5 gap-4 flex items-start flex-col">
            {Vectorfiles.filter((_, i) => i % 3 === 1).map((file) => {
              const [copied, setCopied] = useState(false)
              return (
                <Item>
                  <p class="font-medium leading-snug col-span-2 flex items-center mt-4 ml-4 mb-4 relative z-10">
                    <File class="flex-shrink-0 text-zinc-400 mr-2" size={20} />
                    <span class="md:truncate">
                      {file.name.toLowerCase().replaceAll(" ", "_")}.svg
                    </span>
                  </p>
                  <div class="w-full flex flex-col items-start justify-center gap-12 p-8 pb-4 relative z-10">
                    <div
                      class="mx-auto"
                      dangerouslySetInnerHTML={{ __html: file.data }}
                    />
                    <div class="w-full">
                      <Button
                        type="secondary"
                        small
                        class="w-full justify-center mb-4"
                        function={() => {
                          navigator.clipboard.writeText(file.data)
                          setCopied(true)
                          setTimeout(() => {
                            setCopied(false)
                          }, 1000)
                        }}
                      >
                        {copied ? "Copied!" : "Copy SVG"}
                      </Button>
                      {file.source && (
                        <Button
                          type="text"
                          link={file.source}
                          class="text-zinc-500 text-sm mx-auto"
                        >
                          Source
                        </Button>
                      )}
                    </div>
                  </div>
                </Item>
              )
            })}
          </div>
          <div class="py-0.5 gap-4 flex items-start flex-col">
            {Vectorfiles.filter((_, i) => i % 3 === 2).map((file) => {
              const [copied, setCopied] = useState(false)
              return (
                <Item>
                  <p class="font-medium leading-snug col-span-2 flex items-center mt-4 ml-4 mb-4 relative z-10">
                    <File class="flex-shrink-0 text-zinc-400 mr-2" size={20} />
                    <span class="md:truncate">
                      {file.name.toLowerCase().replaceAll(" ", "_")}.svg
                    </span>
                  </p>
                  <div class="w-full flex flex-col items-start justify-center gap-12 p-8 pb-4 relative z-10">
                    <div
                      class="mx-auto"
                      dangerouslySetInnerHTML={{ __html: file.data }}
                    />
                    <div class="w-full">
                      <Button
                        type="secondary"
                        small
                        class="w-full justify-center mb-4"
                        function={() => {
                          navigator.clipboard.writeText(file.data)
                          setCopied(true)
                          setTimeout(() => {
                            setCopied(false)
                          }, 1000)
                        }}
                      >
                        {copied ? "Copied!" : "Copy SVG"}
                      </Button>
                      {file.source && (
                        <Button
                          type="text"
                          link={file.source}
                          class="text-zinc-500 text-sm mx-auto"
                        >
                          Source
                        </Button>
                      )}
                    </div>
                  </div>
                </Item>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function Item(props: { children: any }) {
  return (
    <div class="w-full bg-zinc-100 dark:bg-zinc-900 relative">
      {" "}
      {props.children}
    </div>
  )
}
