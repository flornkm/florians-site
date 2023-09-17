import { JSX } from "preact/jsx-runtime"
import { usePageContext } from "../../renderer/usePageContext"

export default function Navigation() {
  return (
    <div class="w-full flex items-center justify-between max-w-screen-lx mx-auto py-4 md:px-10 px-6">
      <div class="flex items-center flex-shrink-0 mr-6">
        <a href="/">
          <p class="text-lg font-medium">
            Florian
            <span class="text-sm font-normal text-zinc-500 ml-2">
              Design Engineer
            </span>
          </p>
        </a>
      </div>
      <div class="flex items-center gap-8">
        <NavigationLink href="/">Home</NavigationLink>
        <NavigationLink href="/#work">Work</NavigationLink>
        <NavigationLink href="/about">About</NavigationLink>
        <NavigationLink href="/side-projects">Sides</NavigationLink>
        <NavigationLink href="/feed">Feed</NavigationLink>
      </div>
    </div>
  )
}

const NavigationLink = function (props: JSX.IntrinsicElements["a"]) {
  const pageContext = usePageContext()

  const className = [
    props.className,
    // @ts-ignore
    pageContext.urlPathname === props.href
      ? "text-black before:opacity-100"
      : "text-zinc-400 hover:text-black before:opacity-0",
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <a
      {...props}
      className={`${className} relative transition-colors duration-150 before:absolute before:inset-x-0 before:-bottom-[19px] before:h-[1px] before:bg-black before:transition-all before:duration-300 before:ease-in-out max-md:before:hidden`}
    />
  )
}
