"use client"

import { useState } from "react"
import Image from "next/image"

const Video = (props: any) => {
  const [video, setVideo] = useState(false)

  return (
    <div className="aspect-video">
      {/* If the user clicks on the thumbnail, the video should get rendered. */}
      {props.children[0]}
      {!video && (
        <div className="w-full h-full flex justify-center place-items-center thumbnail">
          {props.children[1].props.children[0]}
          <Image
            src="/images/play_button.svg"
            alt="Play Button"
            onClick={() => {
              setVideo(true)
            }}
            className="absolute z-10 cursor-pointer rounded-full opacity-80 bg-white bg-opacity-90 transition-all hover:scale-105"
            width={96}
            height={96}
          />
        </div>
      )}
      {video && (
        <div className="w-full justify-center place-items-center video">
          {props.children[1].props.children[2]}
        </div>
      )}
    </div>
  )
}

export default Video
