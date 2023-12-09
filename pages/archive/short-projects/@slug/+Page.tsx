import { InlineLink } from "#components/Button"
import "#design-system/markdown.css"
import Markdown from "#markdown/Markdown"

export default function Page(props: Record<string, string>) {
  return (
    <>
      <div class="flex items-center mb-4 py-2 bg-transparent sticky top-0 lg:top-14 z-50">
        <div class="w-screen bg-light-zinc/95 backdrop-blur-xl dark:bg-black/90 absolute top-0 bottom-0 left-1/2 -translate-x-1/2" />
        <div class="flex relative z-20">
          <InlineLink link="/archive" class="px-1.5 -ml-1.5">
            Archive
          </InlineLink>
          <p> / </p>
          <InlineLink
            link="/archive/short-projects"
            class="px-1.5 line-clamp-1"
          >
            Short Projects
          </InlineLink>
          <p> / </p>
          <p class="font-medium px-1.5 text-zinc-400 dark:text-zinc-600 truncate">
            {props.title}
          </p>
        </div>
      </div>
      <Markdown class="lg:pt-7 lg:pb-16 pb-16" content={props.content} />
    </>
  )
}
