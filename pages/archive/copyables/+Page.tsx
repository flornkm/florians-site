import Button, { InlineLink } from "#components/Button"
import Folder from "~icons/eva/folder-outline"
import * as m from "#lang/paraglide/messages"
import README from "#components/README"
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
        <div class="py-0.5 pb-8 gap-4 flex items-start md:flex-row flex-col">
          {Vectorfiles.map((file) => {
            const [copied, setCopied] = useState(false)
            return (
              <div class="bg-zinc-100 flex flex-col items-start justify-center gap-12 p-8 lg:w-1/3 md:w-1/2 w-full">
                <div
                  class="mx-auto"
                  dangerouslySetInnerHTML={{ __html: file.data }}
                />
                <div class="w-full">
                  <Button
                    type="secondary"
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
                  <Button
                    type="text"
                    link={file.source}
                    class="text-zinc-500 text-sm mx-auto"
                  >
                    Source
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
