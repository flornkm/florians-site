import Navigation from "@/components/interface/Navigation"
import Footer from "@/components/interface/Footer"
import { FeedRecords } from "@/components/template/Record"
import { allEntries, allProjects } from "contentlayer/generated"
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

async function fetchGitHubData() {
  try {
    const headers = new Headers()
    headers.append("Content-Type", "application/json")
    headers.append("Authorization", `Bearer ${process.env.GitHubKey}`)

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        query:
          "{\n  viewer {\n    pullRequests(\n      last: 10\n      orderBy: {field: CREATED_AT, direction: ASC}\n      states: MERGED\n    ) {\n      nodes {\n        mergedAt\n        baseRepository {\n          name\n          url\n        }\n        reviews(last: 3) {\n          nodes {\n            author {\n              avatarUrl\n              ... on User {\n                name\n                url\n              }\n            }\n          }\n        }\n        bodyText\n      }\n    }\n  }\n}",
        variables: {},
      }),
      redirect: "follow",
    })

    if (response.ok) {
      const result = await response.json()

      const githubFeed = result.data.viewer.pullRequests.nodes.map(
        (result: any) => ({
          date: result.mergedAt,
          title: `PR in ${result.baseRepository.name}`,
          description: result.bodyText || "",
          url: result.baseRepository.url,
          platform: {
            name: "GitHub",
            icon: "https://unavatar.io/github.com",
            url: "https://github.com/",
          },
          collaborators: result.reviews.nodes.map((review: any) => ({
            name: review.author.name,
            avatar: review.author.avatarUrl,
            url: review.author.url,
          })),
        })
      )

      const filteredFeed = githubFeed.filter((item: any) => {
        const removeDuplicateCollaborators = item.collaborators.filter(
          (collaborator: any, index: number, self: any) =>
            index === self.findIndex((t: any) => t.name === collaborator.name)
        )
        item.collaborators = removeDuplicateCollaborators

        return !item.url.includes("floriandwt")
      })

      return filteredFeed
    } else {
      console.error("Failed to fetch GitHub data")
      return []
    }
  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    return []
  }
}

export default async function Feed() {
  const feed: Post[] = []
  const sortedFeed: Post[] = []

  const youtubeFeed = await fetchYouTubeData()
  const githubFeed = await fetchGitHubData()

  for (const entry of allEntries) {
    feed.push({
      date: entry.date,
      title: entry.title,
      description: entry.body.raw,
      url: `/blog/${entry._raw.flattenedPath.replace("entries/", "")}`,
      platform: {
        name: "Blog",
        icon: "/favicon.ico",
        url: "/blog",
      },
    })
  }

  function convertQuarterToDateString(quarter: string) {
    const dateObject = {
      year: Number(quarter.split(" ")[1]),
      month: Number(
        quarter
          .split(" ")[0]
          .replace("Q1", "01")
          .replace("Q2", "04")
          .replace("Q3", "07")
          .replace("Q4", "10")
      ),
      day: 1,
    }
    const date = new Date(dateObject.year, dateObject.month, dateObject.day)

    return date.toString()
  }

  for (const project of allProjects) {
    const collaborators =
      project.collaborators?.map((collaborator: string) => {
        if (collaborator === "Anton") {
          return {
            name: "Anton Stallbörger",
            avatar: "/images/people/anton_stallboerger.jpg",
            url: "https://www.antonstallboerger.com/",
          }
        } else if (collaborator === "Nils") {
          return {
            name: "Nils Eller",
            avatar: "/images/people/nils_eller.jpg",
            url: "https://www.nilseller.com/",
          }
        } else if (collaborator === "Alice") {
          return {
            name: "Alice Sopp",
            avatar: "/images/people/alice_sopp.jpg",
            url: "https://www.alicesopp.com/",
          }
        }
      }) || ([] as Post["collaborators"])

    feed.push({
      date: convertQuarterToDateString(project.date.split("-")[0]),
      title: `Added ${project.title}`,
      description: project.shortDescription,
      url: `/projects/${project.slug}`,
      platform: {
        name: "Work",
        icon: "/favicon.ico",
        url: "/#work",
      },
      collaborators: collaborators,
    })
  }

  feed.push(...youtubeFeed)
  feed.push(...githubFeed)

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
          <FeedRecords feed={sortedFeed} />
        </div>
      </main>
      <Footer />
    </>
  )
}
