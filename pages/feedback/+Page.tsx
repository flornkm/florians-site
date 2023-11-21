import Button, { ButtonWrapper } from "#components/Button"

export default function Page() {
  return (
    <div class="w-full">
      <section class="py-16 mx-auto max-w-2xl">
        <h1 class="text-2xl font-semibold mb-3">Feedback for Florian</h1>
        <p class="mb-16 text-zinc-500 dark:text-zinc-400">
          Thank you for being down to give me feedback. Please follow the steps
          to make it as efficient for you as possible:
        </p>
        <div class="my-16">
          <h2 class="text-xl font-semibold mb-2">
            1. Watch this video (less than 1 min long)
          </h2>
          <p class="mb-10 text-zinc-500 dark:text-zinc-400">
            Quick explanation.
          </p>
          <iframe
            src="https://embed.wave.video/aWtgaZxA6x9FJClN"
            class="w-full aspect-[16/11]"
            frameBorder="0"
            allow="autoplay; fullscreen"
            scrolling="no"
          ></iframe>
        </div>
        <div class="my-16">
          <h2 class="text-xl font-semibold mb-2">
            2. Go to my new personal site
          </h2>
          <p class="mb-6 text-zinc-500 dark:text-zinc-400">
            Please make sure you're on the correct subdomain
            preview.floriankiem.com
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
          <h2 class="text-xl font-semibold mb-2">3. Give me feedback</h2>
          <p class="mb-6 text-zinc-500 dark:text-zinc-400">
            As said in the video, giving me feedback on x.com / twitter or
            GitHub makes things much easier as I can collect every response on
            one or max. 2 platforms.
          </p>
          <ButtonWrapper>
            <Button type="primary" link="https://twitter.com/flornkm">
              Write me on x
            </Button>
            <Button
              type="secondary"
              link="https://github.com/flornkm/florians-site/issues/new"
            >
              Open issue on GitHub
            </Button>
          </ButtonWrapper>
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
