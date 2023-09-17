import { JSX } from "preact/jsx-runtime"
import { usePageContext } from "../../renderer/usePageContext"

export default function Navigation() {
  return (
    <nav class="w-full flex items-center justify-between max-w-screen-lx mx-auto py-4 md:px-10 px-6">
      <div class="flex items-center flex-shrink-0 mr-6">
        <p class="text-lg font-semibold">
          Florian
          <span></span>
        </p>
      </div>
      <div class="flex items-center gap-8">
        <NavigationLink href="/">Home</NavigationLink>
        <NavigationLink href="/about">About</NavigationLink>
      </div>
    </nav>
  )
}

const NavigationLink = function (props: JSX.IntrinsicElements["a"]) {
  const pageContext = usePageContext()
  const className = [
    props.className,
    // @ts-ignore
    pageContext.urlPathname === props.href
      ? "text-black"
      : "text-zinc-400 hover:text-black",
  ]
    .filter(Boolean)
    .join(" ")
  return <a {...props} className={`${className} transition-colors`} />
}
