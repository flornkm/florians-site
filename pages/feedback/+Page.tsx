import Button, { ButtonWrapper } from "#components/Button"

export default function Page() {
  return (
    <div class="w-full">
      <section class="py-16 mx-auto max-w-2xl">
        <h1 class="text-lg font-semibold mb-3">Hey everyone!</h1>
        <p class="text-zinc-500 dark:text-zinc-400 mb-4">
          I'm currently working on my new personal site. Yes, personal site. Not
          a "portfolio" in the classical sense. It should be more personal, more
          me, while still being a place to showcase my work. :)
        </p>
        <p class="mb-4 text-zinc-500 dark:text-zinc-400">
          Your feedback helps me to realize last changes and improvements,
          therefore I'd love to hear your thoughts on the new site.
        </p>
        <p class="mb-16 font-medium text-black dark:text-white">
          Here's a small guide on how to give me feedback without wasting too
          much of your time.
        </p>
        <div class="my-16">
          <h2 class="text-lg font-semibold mb-2">1. Watch this quick video</h2>
          <p class="mb-10 text-zinc-500 dark:text-zinc-400">
            Just a few words, around a minute long.
          </p>
          <iframe
            src="https://embed.wave.video/p1d2KsjAVaYFg1Wg"
            class="w-full aspect-[16/11]"
            frameBorder="0"
            allow="autoplay; fullscreen"
            scrolling="no"
          ></iframe>
        </div>
        <div class="my-16">
          <h2 class="text-lg font-semibold mb-2">
            2. Go to my new personal site
          </h2>
          <p class="mb-6 text-zinc-500 dark:text-zinc-400">
            Please make sure you're on the correct subdomain
            <code class="font-mono text-sm"> preview.floriankiem.com</code>
          </p>
          <Button
            chevron
            type="primary"
            link="https://preview.floriankiem.com/"
          >
            Visit site
          </Button>
        </div>
        <div class="my-16 mb-32">
          <h2 class="text-lg font-semibold mb-2">3. Give me feedback</h2>
          <p class="mb-4 text-zinc-500 dark:text-zinc-400">
            As said in the video, giving me feedback on X or GitHub makes things
            much easier as I can collect every response on one or max. 2
            platforms.
          </p>
          <p class="mb-6 font-medium text-black dark:text-white">
            There is a chance I will not implement some of the feedback I
            receive because some implementations were made on purpose. Please
            don't hate me for that {`<3`} I still very much appreciate any
            feedback!
          </p>
          <Button type="primary" link="https://twitter.com/flornkm">
            Write me on x
          </Button>
          {/* <Button
              type="secondary"
              link="https://github.com/flornkm/florians-site/issues/new"
            >
              Open issue on GitHub
            </Button> */}
        </div>
        <p class="text-center mb-8 text-gray-400 dark:text-gray-700">
          Thanks! ♥️
        </p>
        <img
          alt="Signature"
          src="https://user-images.githubusercontent.com/92092993/282730965-b5a49150-459d-4eb5-a1e6-a0e9850c02b0.png"
          class="mx-auto w-24 opacity-40"
        />
      </section>
    </div>
  )
}
