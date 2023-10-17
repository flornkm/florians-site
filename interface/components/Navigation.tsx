import { JSX } from "preact/jsx-runtime"
import { usePageContext } from "../../renderer/usePageContext"
import { useRef, useEffect, useState } from "preact/hooks"
import Tooltip from "./Tooltip"

export default function Navigation() {
  const [strokePosition, setStrokePosition] = useState({
    x: 0,
    width: 0,
  })
  const stroke = useRef(null)

  const pageContext = usePageContext()

  useEffect(() => {
    const activeLink = document.querySelector(
      // @ts-ignore
      `a[href="${pageContext.urlPathname}"]`
    )
    if (activeLink) {
      const { x, width } = activeLink.getBoundingClientRect()
      setStrokePosition({
        x: x,
        width: width,
      })

      // @ts-ignore
      stroke.current.classList.remove("opacity-0")
      setTimeout(() => {
        if (stroke.current) {
          // @ts-ignore
          stroke.current.classList.add("transition-all")
        }
      }, 100)
    }
  }, [pageContext])

  return (
    <div class="w-full flex items-center justify-between max-w-screen-lx mx-auto md:px-10 px-6">
      <div class="flex items-center flex-shrink-0 mr-6">
        <a href="/#" class="group">
          <p class="text-lg font-semibold group-hover:text-zinc-500 transition-colors">
            Florian
            <span class="text-sm font-normal text-zinc-500 group-hover:text-zinc-400 ml-2 transition-colors">
              Design Engineer
            </span>
          </p>
        </a>
      </div>
      <div class="flex items-center gap-8" id="nav-links">
        <NavigationLink href="/">Home</NavigationLink>
        <NavigationLink href="/about">About</NavigationLink>
        <NavigationLink href="/sidework">Sidework</NavigationLink>
        <NavigationLink href="/feed">Feed</NavigationLink>
        {pageContext &&
          (pageContext?.urlPathname === "/" ||
            pageContext?.urlPathname === "/about" ||
            pageContext?.urlPathname === "/sidework" ||
            pageContext?.urlPathname === "/feed") && (
            <div
              ref={stroke}
              style={{
                left: strokePosition.x,
                width: strokePosition.width,
              }}
              class="h-[1px] absolute bottom-[-1px] bg-black opacity-0"
            />
          )}
      </div>
    </div>
  )
}

const NavigationLink = function (props: JSX.IntrinsicElements["a"]) {
  const pageContext = usePageContext()

  const className = [
    props.className,
    // @ts-ignore
    pageContext?.urlPathname === props.href
      ? "text-black before:opacity-0"
      : "text-zinc-400 hover:text-black before:opacity-0",
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <a
      {...props}
      className={`${className} py-4 transition-colors duration-150 before:absolute group font-medium
      before:inset-x-0 before:-bottom-[3px] before:h-[1px] before:bg-black max-md:before:hidden relative`}
    />
  )
}
