import * as React from "react"
import NextImage from "next/image"
import NextLink from "next/link"
import { useMDXComponent } from "next-contentlayer/hooks"
import ProjectLayout from "@/layout/ProjectLayout"

function Image(props: any) {
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
    return <NextImage width={1280} height={720} alt={props.alt} {...props} />
  }
}

function Button(props: any) {
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

const components = {
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
  p: (props: any) => <p className="my-6 leading-relaxed" {...props} />,
  strong: (props: any) => <b className="font-medium" {...props} />,
  a: Button,
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
      <ProjectLayout {...props}>
        <Component components={{ ...components }} />
      </ProjectLayout>
    )
  } else {
    return <Component components={{ ...components }} />
  }
}
