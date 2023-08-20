import { allEntries } from "contentlayer/generated"
import Image from "next/image"
import { Markdown } from "@/markdown/parseMarkdown"
import Navigation from "@/components/interface/Navigation"
import Footer from "@/components/interface/Footer"

export const generateStaticParams = async () =>
  allEntries.map((entry: any) => ({ slug: entry._raw.flattenedPath }))

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const entry = allEntries.find(
    (entry: any) => entry._raw.flattenedPath === "entries/" + params.slug
  )
  return { title: entry?.title }
}

const EntryLayout = ({ params }: { params: { slug: string } }) => {
  const entry = allEntries.find(
    (entry: any) => entry._raw.flattenedPath === "entries/" + params.slug
  )

  if (entry) {
    return (
      <>
        <Navigation title={entry.title} highlight={"Entry"} />
        <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-transparent dark:text-white relative">
          <div className="flex flex-col items-center justify-center h-full pt-24 max-md:pt-16 mb-6 w-full">
            <div className="max-w-2xl mb-12">
              <Image
                src={entry.image as string}
                alt="Journal Cover"
                width={1920}
                height={500}
                className="mb-10 bg-zinc-50 dark:bg-[#09090b]"
              />
              <div className="flex gap-4 text-sm text-zinc-500 mb-2 font-mono">
                {entry.date}
              </div>
              <h1 className="text-3xl font-semibold text-left mb-6">
                {entry.title}
              </h1>
              <article>
                <Markdown>{entry.body.code}</Markdown>
              </article>
              <div className="h-6"></div>
              <small className="text-zinc-500 mb-10">
                <time>2023</time> - All used images belong to their respective
                owners and are used for demonstration purposes only.
              </small>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  } else {
    return <h1>Entry could not be found</h1>
  }
}

export default EntryLayout
