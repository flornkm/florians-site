import * as React from "react"
import NextImage from "next/image"
import NextLink from "next/link"
import { useMDXComponent } from "next-contentlayer/hooks"
import type { MDXComponents } from "mdx/types"
import "./markdown.css"

const Image = (props: any) => {
  if (props.src.includes("youtube")) {
    return (
      <iframe
        width="100%"
        height="auto"
        src={props.src}
        title="YouTube video player"
        className="aspect-video"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    )
  } else {
    return (
      <NextImage
        width={1280}
        height={720}
        className="bg-zinc-50 dark:bg-zinc-950"
        alt={props.alt}
        {...props}
      />
    )
  }
}

const Button = (props: any) => {
  return (
    <div className="mb-12 mt-6">
      <NextLink
        href={props.href}
        target="_blank"
        className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
      >
        {props.children}
      </NextLink>
    </div>
  )
}

const distance = 64

/*
 * Components Index
 */
const components: MDXComponents = {
  img: Image,
  h1: (props: any) => <h1 className="text-2xl font-semibold mt-2" {...props} />,
  h2: (props: any) => <h2 className="text-xl font-semibold mt-2" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-semibold mt-2" {...props} />,
  h4: (props: any) => (
    <h4 className="text-lg font-semibold mt-4 mb-1" {...props} />
  ),
  h5: (props: any) => (
    <h5 className="text-lg font-semibold mt-4 mb-1" {...props} />
  ),
  h6: (props: any) => (
    <h6 className="text-lg font-semibold mt-4 mb-1" {...props} />
  ),
  p: (props: any) => (
    <p
      className="my-6 leading-relaxed text-zinc-700 dark:text-zinc-300"
      {...props}
    />
  ),
  strong: (props: any) => <b className="font-medium" {...props} />,
  a: Button,
  /*
   * Custom Components
   */
  Layered: (props: { children: React.ReactNode }) => (
    <div
      className="w-full grid grid-cols-1 md:grid-cols-3 layered"
      style={{
        paddingTop: `${distance}px`,
        paddingBottom: `${distance}px`,
      }}
    >
      {props.children}
    </div>
  ),
  Sticked: (props: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 relative items-start gap-4 sticked">
      {props.children}
    </div>
  ),
  Sticky: (props: { children: React.ReactNode }) => (
    <div className="col-span-1 md:sticky md:top-24 gap-4">{props.children}</div>
  ),
  Grid2: (props: { children: React.ReactNode }) => (
    <div className="col-span-2">{props.children}</div>
  ),
  Flex: (props: { children: React.ReactNode }) => (
    <div className="flex items-center justify-end md:grid-cols-2 gap-4 flex-wrap">
      {props.children}
    </div>
  ),
  Video: (props: { children: React.ReactNode }) => (
    // TODO: Code the video component
    <div className="aspect-video hidden">{props.children}</div>
  ),
}

interface MdxProps {
  children: string
}

export function Markdown(props: {
  type?: string
  children: MdxProps["children"]
}) {
  const Component = useMDXComponent(props.children)

  if (props.type === "project") {
    return (
      <div className="md:pt-24">
        <Component type={props.type} components={{ ...components }} />
      </div>
    )
  } else {
    return <Component components={{ ...components }} />
  }
}
