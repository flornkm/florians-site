"use client"

import Image from "next/image"
import type { Post } from "@/app/feed/schema"
import Link from "next/link"

export default function Record({ feed }: { feed: Record<string, any>[] }) {
  return (
    <div className="flex flex-col justify-center">
      {feed.map((post: Record<string, any>) => {
        post.date = new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        return (
          <>
            <Link
              href={post.url}
              target={post.url.includes("https") ? "_blank" : "_self"}
              key={feed.indexOf(post as Post)}
              className="gap-24 py-8 flex w-full justify-between group mx-auto max-md:flex-col max-md:gap-12"
            >
              <div className="flex gap-8 group-hover:opacity-60 duration-150">
                <div className="flex flex-col gap-2 max-w-sm">
                  <h3 className="font-medium text-lg text-zinc-900 dark:text-zinc-300 truncate">
                    {post.title}
                  </h3>
                  <p className="text-zinc-500 line-clamp-2">
                    {post.description.replaceAll("#", "").replaceAll("*", "")}
                  </p>
                </div>
              </div>
              <div className="h-full flex w-32 flex-col items-start gap-2 text-zinc-800 dark:text-zinc-200">
                <pre className="font-mono text-xs group-hover:opacity-60 duration-150">
                  {post.date}
                </pre>
                <Link
                  className="flex items-center text-sm gap-2 py-0.5 px-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  target={
                    post.platform.url.includes("https") ? "_blank" : "_self"
                  }
                  href={post.platform.url}
                >
                  <Image
                    src={post.platform.icon}
                    alt="Post Image"
                    width={48}
                    height={48}
                    className="rounded-md h-3.5 w-3.5"
                  />
                  <h4>{post.platform.name}</h4>
                </Link>
              </div>
            </Link>
            {feed.length !== feed.indexOf(post as Post) + 1 && (
              <div className="h-[1px] bg-zinc-100" />
            )}
          </>
        )
      })}
    </div>
  )
}
