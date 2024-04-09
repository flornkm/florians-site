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
            className="p-4 transition-colors rounded-lg flex items-center justify-center group"
          >
            <div className="flex flex-col items-center gap-2 w-28">
              <div class="text-neutral-400 group-hover:text-neutral-500 relative transition-colors dark:text-neutral-500 dark:group-hover:text-neutral-400">
                <FolderIllustration />
              </div>
              <p className="font-medium text-center">..</p>
            </div>
          </a>
          {projects.map((project: any) => {
            return (
              <a
                href={project.url}
                className="p-4 transition-colors rounded-lg flex items-center justify-center group"
              >
                <div class="flex flex-col items-center gap-2 w-28">
                  <div class="text-neutral-400 group-hover:text-neutral-500 relative transition-colors dark:text-neutral-500 dark:group-hover:text-neutral-400">
                    <FolderIllustration />
                  </div>
                  <p class="font-medium text-center">{project.title}</p>
                </div>
              </a>
            )
          })}
          <div class="xl:col-span-5 md:col-span-3 xs:col-span-2">
            <README>
              <p class="text-neutral-500 dark:text-neutral-400">
                Projects are long-term projects that I've worked on. They're
                usually larger in scope and take a longer time to complete.
              </p>
            </README>
          </div>
        </div>
      </FileSystem>
    </div>
  )
}
