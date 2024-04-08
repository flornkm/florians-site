import README from "#components/README"
import { FolderIllustration } from "#design-system/Vectors"
import FileSystem from "#sections/FileSystem"

export default function Page({ projects }: { projects: any }) {
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
          {projects.map((project: any) => {
            return (
              <a
                href={project.url}
                class="p-4 transition-colors hover:bg-neutral-200 rounded-lg flex items-center justify-center"
              >
                <div class="flex flex-col items-center gap-2 w-28">
                  <FolderIllustration />
                  <p class="font-medium text-center">{project.title}</p>
                </div>
              </a>
            )
          })}
          <div class="xl:col-span-5 md:col-span-3 xs:col-span-2">
            <README>
              <p class="text-neutral-500 dark:text-neutral-400">
                Short projects have a shorter case study and are usually smaller
                in scope.
              </p>
            </README>
          </div>
        </div>
      </FileSystem>
    </div>
  )
}
