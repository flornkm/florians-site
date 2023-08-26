import Navigation from "@/components/interface/Navigation"
import Footer from "@/components/interface/Footer"
import Record from "@/components/client/Record"
import type { Metadata } from "next"
import type { Post } from "./schema"

export const metadata: Metadata = {
  title: "Feed",
  description: "All my posts from different platforms in one place.",
}

export default function Feed() {
  const feed: Post = []
  
  fetch(`https://www.googleapis.com/youtube/v3/search?key=${process.env.YoutubeKey}&channelId=UCoYr999CTO9-Icsr3ra3OsQ&order=date&maxResults=20\n`, {
    method: 'GET',
    redirect: 'follow'
  })
    .then(res => res.text())
    .then(results => {
      for (const result of JSON.parse(results).items) {
        feed.push({
          date: "test",
          title: result.id.videoID,
          description: result.id.videoID,
          url: `https://www.youtube.com/watch?v=${result.id.videoId}`,
          platform: {
            name: "Youtube",
            icon: "https://unavatar.io/youtube.com",
          }
        })
      }
    })


  return (
    <>
      <Navigation title="Feed" />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <div className="min-h-screen py-16">
            <Record feed={feed} />
        </div>
      </main>
      <Footer />
    </>
  )
}
