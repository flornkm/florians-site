export default function Markdown(props: {
  class?: string
  content: string
  noSelect?: boolean
}) {
  // Regular expression pattern to capture video ID and image source
  const pattern =
    /<a\s+href="([A-Za-z0-9_-]{11})"\s*><img\s+src="([^"]+)"[^>]+><\/a>/g

  // Replace the matches with the cover image and add click event
  const replacedContent = props.content.replace(
    pattern,
    (match, videoId, imgSrc) => `<div
      class="video-container"
      onclick="this.innerHTML = '<iframe width=&quot;100%&quot; height=&quot;100%&quot; style=&quot;aspect-ratio: 16/9&quot; src=&quot;https://www.youtube.com/embed/${videoId}?autoplay=1&quot; allow=&quot;accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share&quot; frameborder=&quot;0&quot; allowfullscreen autoplay></iframe>';"
      style="cursor: pointer; width: 100%; height: auto;">
      <div class="video-wrapper">
          <img
              src="${imgSrc}"
              class="video-overlay"
              alt="Video cover"
              style="width: 100%; height: auto;"
          />
      </div>
  </div>`
  )

  return (
    <article
      class={props.class}
      style={{ userSelect: props.noSelect ? "none" : "auto" }}
    >
      <div dangerouslySetInnerHTML={{ __html: replacedContent }}></div>
    </article>
  )
}
