import Button, { InlineLink } from "#components/Button"
import File from "~icons/eva/file-outline"
import Vectorfiles from "./assets/vectorfiles.json"
import { useState } from "preact/hooks"

export default function Page() {
  return (
    <div class="w-full">
      <section class="w-full pb-24">
        <div class="flex items-center py-2  bg-light-zinc/95 backdrop-blur-xl dark:bg-black/90 sticky top-0 lg:top-14 z-50">
          <InlineLink link="/archive" class="px-1.5 -ml-1.5">
            Archive
          </InlineLink>
          <p> / </p>
          <p class="font-medium px-1.5 text-zinc-400 dark:text-zinc-600">
            Copyables
          </p>
        </div>
        <h1 class="text-3xl font-semibold mt-12 mb-6">Copyables</h1>
        <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 w-full gap-4 h-full min-h-screen">
          <div class="py-0.5 gap-4 flex items-start flex-col h-full">
            <Item>
              <div class="p-8">
                <p class="font-semibold font-rounded text-zinc-500 dark:text-zinc-400">
                  Yes, you can copy these and paste them directly into Figma or
                  your code editor. ;)
                </p>
              </div>
            </Item>
            {Vectorfiles.filter((_, i) => i % 3 === 0).map((file) => {
              const [copied, setCopied] = useState(false)
              return (
                <Item>
                  <p class="font-medium leading-snug col-span-2 flex items-center mt-4 ml-2 mb-4 relative z-10">
                    <File class="w-8 flex-shrink-0 text-zinc-400" />
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
                  <p class="font-medium leading-snug col-span-2 flex items-center mt-4 ml-2 mb-4 relative z-10">
                    <File class="w-8 flex-shrink-0 text-zinc-400" />
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
                  <p class="font-medium leading-snug col-span-2 flex items-center mt-4 ml-2 mb-4 relative z-10">
                    <File class="w-8 flex-shrink-0 text-zinc-400" />
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
    <div class="w-full bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
      {" "}
      {props.children}
    </div>
  )
}
