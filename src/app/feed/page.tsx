import Navigation from "@/components/interface/Navigation"
import Footer from "@/components/interface/Footer"
import Record from "@/components/client/Record"
import { allEntries } from "contentlayer/generated"
import type { Metadata } from "next"
import type { Post } from "./schema"

export const metadata: Metadata = {
  title: "Feed",
  description: "All my posts from different platforms in one place.",
}

async function fetchYouTubeData() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${process.env.YoutubeKey}&channelId=UCoYr999CTO9-Icsr3ra3OsQ&order=date&maxResults=5&part=snippet\n`,
      {
        method: "GET",
        redirect: "follow",
      }
    )

    if (response.ok) {
      const data = await response.json()

      const youtubeFeed: Post[] = data.items.map((result: any) => ({
        date: result.snippet.publishedAt,
        title: result.snippet.title,
        description: result.snippet.description,
        url: `https://www.youtube.com/watch?v=${result.id.videoId}`,
        platform: {
          name: "Youtube",
          icon: "https://unavatar.io/youtube.com",
          url: "https://www.youtube.com/",
        },
      }))

      return youtubeFeed
    } else {
      console.error("Failed to fetch YouTube data")
      return []
    }
  } catch (error) {
    console.error("Error fetching YouTube data:", error)
    return []
  }
}

export default async function Feed() {
  const feed: Post[] = []
  const sortedFeed: Post[] = []

  const youtubeFeed = await fetchYouTubeData()

  for (const entry of allEntries) {
    feed.push({
      date: entry.date,
      title: entry.title,
      description: entry.body.raw,
      url: `/blog/${entry._raw.flattenedPath.replace("entries/", "")}`,
      platform: {
        name: "Blog",
        icon: "https://unavatar.io/floriandwt",
        url: "/blog",
      },
    })
  }

  feed.push(...youtubeFeed)

  sortedFeed.push(
    ...feed.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  )

  return (
    <>
      <Navigation title="Feed" />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <div className="min-h-screen py-16">
          <h1 className="text-3xl font-semibold text-left mb-4">Feed</h1>
          <Record feed={sortedFeed} />
        </div>
      </main>
      <Footer />
    </>
  )
}
