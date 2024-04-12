import README from "#components/README"
import Tooltip from "#components/Tooltip"
import { FolderIllustration } from "#design-system/Vectors"
import * as m from "#lang/paraglide/messages"
import FileSystem, { tabs } from "#sections/FileSystem"

export default function Page() {
  return (
    <div class="w-full">
      <FileSystem items={{ amount: tabs.length, label: "categories" }}>
        <div class="w-full gap-4 items-start grid xl:grid-cols-5 md:grid-cols-3 xs:grid-cols-2">
          {tabs.map((tab) => (
            <button
              onClick={(e) => {
                if (
                  e.detail === 1 &&
                  typeof window !== "undefined" &&
                  window.innerWidth > 768
                )
                  e.preventDefault()
                else window.location.href = tab.path
              }}
              className="p-4 relative rounded-lg flex items-center justify-center group cursor-default active:scale-95 transition-transform duration-75"
            >
              <div class="flex flex-col items-center gap-2 w-28">
                <div class="text-neutral-400 relative dark:text-neutral-500">
                  <FolderIllustration />
                </div>
                <p class="font-medium text-center text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors duration-75">
                  {tab.name}
                </p>
              </div>
            </button>
          ))}
          <div class="xl:col-span-5 md:col-span-3 xs:col-span-2">
            <README>
              <p class="text-neutral-500 dark:text-neutral-400 place-self-end">
                {m.archive_description()}
              </p>
            </README>
          </div>
        </div>
      </FileSystem>
    </div>
  )
}
