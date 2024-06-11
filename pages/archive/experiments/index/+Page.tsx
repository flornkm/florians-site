import { FolderIllustration } from "#design-system/Vectors"
import FileSystem from "#sections/FileSystem"

const experiments = [
  {
    title: "API Key Creation",
    path: "/archive/experiments/api-key",
  },
  {
    title: "Custom Caret",
    path: "/archive/experiments/custom-caret",
  },
  {
    title: "Splitview",
    path: "/archive/experiments/splitview",
  },
  // !TODO Adjust for Safari later on
  // {
  //   title: "Apple Intelligence",
  //   path: "/archive/experiments/apple-intelligence",
  // },
]

export default function Page() {
  return (
    <div className="w-full">
      <FileSystem items={{ amount: experiments.length, label: "experiments" }}>
        <div className="w-full gap-4 items-start grid xl:grid-cols-5 md:grid-cols-3 xs:grid-cols-2">
          <a
            href="/archive"
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
          </a>
          {experiments.map((experiment) => (
            <a
              href={experiment.path}
              className="p-4 relative rounded-lg flex items-center justify-center group cursor-default active:scale-95 transition-transform duration-75"
            >
              <div className="flex flex-col items-center gap-2 w-28">
                <div className="text-neutral-400 relative dark:text-neutral-500">
                  <FolderIllustration />
                </div>
                <p className="font-medium truncate text-center text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors duration-75">
                  {experiment.title}
                </p>
              </div>
            </a>
          ))}
        </div>
      </FileSystem>
    </div>
  )
}

function Item(props: { children: any }) {
  return (
    <div className="w-full bg-neutral-100 dark:bg-neutral-900 relative">
      {props.children}
    </div>
  )
}
