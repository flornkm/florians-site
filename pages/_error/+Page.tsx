import Button, { ButtonWrapper } from "#components/Button"
import * as m from "#lang/paraglide/messages"

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
          <span class="transition-all hover:animate-pulse hover:bg-zinc-100 px-1 rounded-md relative">
            4
          </span>
          <span class="transition-all hover:animate-pulse hover:bg-zinc-100 px-1 rounded-md relative">
            0
          </span>
          <span class="transition-all hover:animate-pulse hover:bg-zinc-100 px-1 rounded-md relative">
            4
          </span>
        </h1>
        <p class="text-center mb-4">
          {m.not_found_error_first()} <br class="hidden xs:block" />{" "}
          {m.not_found_error_second()}
        </p>
        <Button type="secondary" link="/">
          {m.button_return_home()}
        </Button>
      </div>
    </div>
  )
}

function Page500() {
  return (
    <div class="w-full h-[90vh] flex justify-center items-center">
      <div class="flex flex-col justify-center items-center gap-4 max-w-xs">
        <h1 class="text-6xl text-red-600 font-bold text-center leading-none hover:cursor-none">
          <span class="transition-all hover:animate-pulse hover:bg-red-100 px-1 rounded-md relative">
            5
          </span>
          <span class="transition-all hover:animate-pulse hover:bg-red-100 px-1 rounded-md relative">
            0
          </span>
          <span class="transition-all hover:animate-pulse hover:bg-red-100 px-1 rounded-md relative">
            0
          </span>
        </h1>
        <p class="text-center mb-4 bg-gradient-to-b from-red-500 via-black via-60% to-black bg-clip-text text-transparent">
          {m.server_error_first()}
          <br class="hidden xs:block" />
          {m.server_error_second()}{" "}
        </p>
        <ButtonWrapper>
          <Button type="primary" link="/">
            {m.button_return_home()}
          </Button>
          <Button
            type="secondary"
            link="https://github.com/flornkm/florians-website/"
          >
            {m.button_open_issue()}
          </Button>
        </ButtonWrapper>
      </div>
    </div>
  )
}
