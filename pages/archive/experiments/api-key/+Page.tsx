import Button, { InlineLink } from "#components/Button"
import { Eye, Rotate, Trash } from "#design-system/Icons"
import { useState } from "preact/hooks"

export default function Page() {
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <>
      <div class="flex items-center mb-4 py-2 bg-transparent sticky top-0 lg:top-14 z-50">
        <div class="w-[99vw] bg-light-neutral/95 backdrop-blur-xl dark:bg-black/90 absolute top-0 bottom-0 left-1/2 -translate-x-1/2" />
        <div class="flex relative z-20">
          <InlineLink link="/archive" class="px-1.5 -ml-1.5">
            Archive
          </InlineLink>
          <p> / </p>
          <InlineLink link="/archive/experiments" class="px-1.5 line-clamp-1">
            Experiments
          </InlineLink>
          <p> / </p>
          <p class="font-medium px-1.5 text-neutral-400 dark:text-neutral-600 truncate">
            API Key
          </p>
        </div>
      </div>
      <div class="w-full h-[calc(100vh-256px)] flex items-center justify-center">
        <div class="border border-neutral-200 overflow-x-auto custom-scrollbar dark:border-neutral-700 rounded-xl overflow-hidden shadow-lg shadow-black/[2%]">
          <table class="max-w-3xl w-full border-spacing-1 table-auto border-collapse">
            <thead class="h-10 text-neutral-900 dark:text-white dark:bg-neutral-800">
              <tr class="border-b border-b-neutral-200">
                <th class="text-left font-medium px-4 py-2">Name</th>
                <th class="text-left font-medium px-4 py-2">Secret</th>
                <th class="text-left font-medium px-4 py-2">Manage</th>
              </tr>
              <tr>
                <td class="h-14 px-4 border-t truncate border-y-neutral-200 border-l-0 dark:border-neutral-700 dark:bg-neutral-900">
                  Default API Key
                </td>
                <td class="h-14 px-4 border-t border-y-neutral-200 border-r-0 dark:border-neutral-700 dark:bg-neutral-900">
                  <div
                    class={
                      "flex w-[340px] h-11 rounded-lg items-center justify-between gap-4 pl-4 px-1 py-1 " +
                      (loading
                        ? "animate-pulse bg-neutral-200 dark:bg-neutral-700"
                        : "bg-neutral-100 dark:bg-neutral-800")
                    }
                  >
                    {loading ? (
                      <div />
                    ) : (
                      <>
                        {showSecret ? (
                          <span class="truncate">
                            3d4f2bf07dc1be38b20cd6e4694
                          </span>
                        ) : (
                          <span class="truncate">●●●●●●●●●●●●●●●●●●</span>
                        )}
                        <Button
                          type="secondary"
                          small
                          function={() => setShowSecret(!showSecret)}
                          class="relative hover:bg-neutral-200 dark:!border-neutral-700 dark:hover:!bg-neutral-700 flex items-center justify-center rounded-lg h-9 group aspect-square"
                        >
                          <>
                            <div
                              class={
                                "left-1/2 transition-all duration-200 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-full w-[2px] -rotate-45 bg-black dark:bg-white absolute z-10 " +
                                (showSecret
                                  ? "h-0 outline-none"
                                  : "h-5 outline-2 outline outline-neutral-100 dark:outline-neutral-800 dark:group-hover:outline-neutral-700 group-hover:outline-neutral-200")
                              }
                            />
                            <Eye class="flex-shrink-0" size={20} />
                          </>
                        </Button>
                      </>
                    )}
                  </div>
                </td>
                <td class="h-14 pl-4 pr-2 border-t border-y-neutral-200 dark:border-neutral-700 dark:bg-neutral-900">
                  <div class="flex items-center gap-2">
                    <Button
                      type="secondary"
                      small
                      function={() => {
                        setLoading(true)
                        setTimeout(() => {
                          setLoading(false)
                        }, 1000)
                      }}
                      class="relative hover:bg-neutral-200 dark:border-neutral-800 dark:hover:!bg-neutral-800 flex items-center justify-center rounded-lg h-10 w-10 group aspect-square"
                    >
                      <Rotate
                        class={
                          "flex-shrink-0 transition-all duration-1000 ease-out " +
                          (loading ? "animate-spin" : "")
                        }
                        size={20}
                        stroke={2}
                      />
                    </Button>
                    <Button
                      type="secondary"
                      small
                      class="relative border-red-200 hover:bg-red-200 dark:border-red-500/20 dark:hover:bg-red-500/20 dark:hover:border-transparent flex items-center justify-center rounded-lg h-10 w-10 group aspect-square"
                    >
                      <Trash class="flex-shrink-0 text-red-500" size={20} />
                    </Button>
                  </div>
                </td>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </>
  )
}
