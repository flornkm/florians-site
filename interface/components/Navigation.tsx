import { JSX } from "preact/jsx-runtime"
import { usePageContext } from "../../renderer/usePageContext"
import { useRef, useEffect, useState } from "preact/hooks"
import { useWindowResize } from "../hooks/useWindowResize"

export default function Navigation() {
  const [selectorPosition, setSelectorPosition] = useState({
    x: 0,
    width: 0,
  })
  const selector = useRef(null)

  const pageContext = usePageContext()

  useEffect(() => {
    const activeLink = document.querySelector(
      // @ts-ignore
      `a[href="${pageContext.urlPathname}"]`
    )

    if (activeLink) {
      const { x, width } = activeLink.getBoundingClientRect()

      // Adjustments for mobile screens
      const isMobile = typeof window !== "undefined" && window.innerWidth < 786
      const mobileWidthFactor = 1.25

      setSelectorPosition({
        x: isMobile ? x - width / (mobileWidthFactor * 2) : x,
        width: isMobile ? width * mobileWidthFactor : width,
      })

      // @ts-ignore
      selector.current.classList.remove("opacity-0")
      setTimeout(() => {
        if (selector.current) {
          // @ts-ignore
          selector.current.classList.add("transition-all")
        }
      }, 100)
    }
  }, [pageContext])

  return (
    <div class="w-full flex items-center justify-between max-w-screen-lx mx-auto md:px-10 min-[350px]:px-4 xs:px-3">
      <div class="items-center flex-shrink-0 mr-6 hidden md:flex">
        <a href="/#" class="group">
          <p class="text-lg font-semibold group-hover:text-zinc-500 transition-colors">
            Florian
            <span class="text-sm font-normal text-zinc-500 group-hover:text-zinc-400 ml-2 transition-colors hidden lg:inline-block">
              Design Engineer
            </span>
          </p>
        </a>
      </div>
      <div
        class="flex items-center md:gap-8 gap-2 justify-between md:justify-normal w-full md:w-auto lg:px-0 md:px-1.5 px-0"
        id="nav-links"
      >
        <NavigationLink href="/">Home</NavigationLink>
        <NavigationLink href="/about">About</NavigationLink>{" "}
        <NavigationLink href="/feed">Feed</NavigationLink>
        <NavigationLink href="/archive">Archive</NavigationLink>
        {pageContext &&
          (pageContext?.urlPathname === "/" ||
            pageContext?.urlPathname === "/about" ||
            pageContext?.urlPathname === "/archive" ||
            pageContext?.urlPathname === "/feed") && (
            <div
              ref={selector}
              style={{
                left: selectorPosition.x,
                width: selectorPosition.width,
              }}
              class="lg:h-[1px] h-12 lg:-translate-x-0 flex-shrink-0 absolute lg:bottom-[-1px] bg-black opacity-0 rounded-full lg:rounded-none"
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
      ? "lg:text-black text-white relative z-10 before:opacity-0"
      : "text-zinc-400 hover:text-black before:opacity-0",
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <a
      {...props}
      className={`${className} py-4 transition-colors duration-150 before:absolute group font-medium md:w-auto w-full text-center
      before:inset-x-0 before:-bottom-[3px] before:h-[1px] before:bg-black max-md:before:hidden relative z-10 text-sm xs:text-base`}
    />
  )
}
