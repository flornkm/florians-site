import Button, { ButtonWrapper } from "#components/Button"

export default function Page({ is404 }: { is404: boolean }) {
  if (is404) {
    return <Page404 />
  } else {
    return <Page500 />
  }
}

function Page404() {
  return (
    <div class="w-full h-[90vh] flex justify-center items-center">
      <div class="flex flex-col justify-center items-center gap-4 max-w-xs">
        <h1 class="text-6xl font-bold text-center leading-none hover:cursor-none">
          <span class="transition-all hover:animate-pulse hover:bg-zinc-100 px-1 rounded-md relative dark:hover:bg-zinc-900">
            4
          </span>
          <span class="transition-all hover:animate-pulse hover:bg-zinc-100 px-1 rounded-md relative dark:hover:bg-zinc-900">
            0
          </span>
          <span class="transition-all hover:animate-pulse hover:bg-zinc-100 px-1 rounded-md relative dark:hover:bg-zinc-900">
            4
          </span>
        </h1>
        <p class="text-center mb-4">
          This page couldn't be found <br class="hidden xs:block" /> Please try
          again later
        </p>
        <Button type="secondary" link="/">
          Homepage
        </Button>
      </div>
    </div>
  )
}

function Page500() {
  return (
    <div class="w-full h-[90vh] flex justify-center items-center">
      <div class="flex flex-col justify-center items-center gap-4 max-w-xs">
        <h1 class="text-6xl text-red-600 font-bold text-center leading-none hover:cursor-none dark:text-red-500">
          <span class="transition-all hover:animate-pulse hover:bg-red-100 px-1 rounded-md relative dark:hover:bg-red-900">
            5
          </span>
          <span class="transition-all hover:animate-pulse hover:bg-red-100 px-1 rounded-md relative dark:hover:bg-red-900">
            0
          </span>
          <span class="transition-all hover:animate-pulse hover:bg-red-100 px-1 rounded-md relative dark:hover:bg-red-900">
            0
          </span>
        </h1>
        <p class="text-center mb-4 bg-gradient-to-b from-red-500 via-black via-60% to-black bg-clip-text text-transparent">
          You encountered an error.
          <br class="hidden xs:block" />
          Please try again later or open an issue.{" "}
        </p>
        <ButtonWrapper>
          <Button
            type="primary"
            function={() => {
              window.history.back()
            }}
          >
            Go back
          </Button>
          <Button
            type="secondary"
            link="https://github.com/flornkm/florians-website/"
          >
            Open issue
          </Button>
        </ButtonWrapper>
      </div>
    </div>
  )
}
