import NextImage from "next/image"
import NextLink from "next/link"
import NextVideo from "./components/Video"
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    )
  } else {
    return (
      <NextImage
        width={1280}
        height={720}
        className="bg-zinc-50 dark:bg-zinc-950 object-cover"
        alt={props.alt}
        {...props}
      />
    )
  }
}

// const Video = (props: any) => {
//   const [video, setVideo] = useState(false)

//   return (
//     <div className="aspect-video">
//       {/* If the user clicks on the thumbnail, the video should get rendered. */}
//       {props.children[0]}
//       {!video && (
//         <div className="w-full h-full flex justify-center place-items-center thumbnail">
//           {props.children[1].props.children[0]}
//           <Image
//             src="/images/play_button.svg"
//             alt="Play Button"
//             onClick={() => {
//               setVideo(true)
//             }}
//             className="absolute z-10 cursor-pointer rounded-full opacity-80 bg-white bg-opacity-90 transition-all hover:scale-105"
//             width={96}
//             height={96}
//           />
//         </div>
//       )}
//       {video && (
//         <div className="w-full justify-center place-items-center video">
//           {props.children[1].props.children[2]}
//         </div>
//       )}
//     </div>
//   )
// }

const Button = (props: any) => {
  const url = new URL(props.href)

  return (
    <div className="mb-12 mt-6">
      <NextLink
        href={props.href}
        target="_blank"
        id="button"
        className="dflt-button dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white"
      >
        <Image
          src={`https://unavatar.io/${url.hostname}`}
          alt="Favicon"
          className="rounded-full w-5 h-5"
        />
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
  Video: NextVideo,
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
