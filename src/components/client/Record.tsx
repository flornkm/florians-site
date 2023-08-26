"use client"

import Image from "next/image"
import type { Post } from "@/app/feed/schema"
import Link from "next/link"

export default function Record({ feed }: { feed: Post[] }) {
  return (
    <div className="flex flex-col gap-4 justify-center">
      {feed.map((post: Post) => {
        return (
          <>
            <Link
              href={post.url}
              target="_blank"
              key={feed.indexOf(post)}
              className="p-4 gap-24 flex justify-between group mx-auto"
            >
              <div className="flex gap-8">
                <Image
                  src={`https://img.youtube.com/vi/${post.url.replace(
                    "https://www.youtube.com/watch?v=",
                    ""
                  )}/hqdefault.jpg`}
                  alt="Post Image"
                  width={1280}
                  height={720}
                  className="rounded-md aspect-video max-w-[200px] h-auto mb-4 object-cover"
                />
                <h3 className="font-bold text-lg group-hover:underline text-zinc-700 dark:text-zinc-300">
                  {post.title}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <Image
                  src={post.platform.icon}
                  alt="Post Image"
                  width={48}
                  height={48}
                  className="rounded-md h-6 w-6 bg-zinc-100 p-1"
                />
                <h4 className="font-medium">{post.platform.name}</h4>
              </div>
            </Link>
            {/* <div className="h-[1px] bg-zinc-100" /> */}
          </>
        )
      })}
    </div>
  )
}
