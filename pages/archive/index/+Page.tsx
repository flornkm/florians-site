import README from "#components/README"
import { FolderIllustration } from "#design-system/Vectors"
import * as m from "#lang/paraglide/messages"
import FileSystem, { tabs } from "#sections/FileSystem"

export default function Page() {
  return (
    <div class="w-full">
      <FileSystem>
        <div class="w-full gap-4 items-start grid xl:grid-cols-5 md:grid-cols-3 xs:grid-cols-2 xs:grid-cols-2">
          {tabs.map((tab) => (
            <a
              href={tab.path}
              class="p-4 transition-colors hover:bg-neutral-200 rounded-lg flex items-center justify-center"
            >
              <div class="flex flex-col items-center gap-2 w-28">
                <FolderIllustration />
                <p class="font-medium text-center">{tab.name}</p>
              </div>
            </a>
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
