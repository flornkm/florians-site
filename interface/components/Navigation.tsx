import { JSX } from "preact/jsx-runtime"
import { usePageContext } from "../../renderer/usePageContext"
import { useRef, useEffect, useState, useLayoutEffect } from "preact/hooks"
import { getLocale } from "#hooks/getLocale"
import { languageTag, sourceLanguageTag } from "#lang/paraglide/runtime"
import * as m from "#lang/paraglide/messages"
import { navigate } from "vike/client/router"

export default function Navigation() {
  const [selectorPosition, setSelectorPosition] = useState({
    x: 0,
    width: 0,
  })
  const selector = useRef(null)

  const pageContext = usePageContext() as any

  function handleSelector() {
    const currentPath =
      getLocale() + pageContext.urlPathname.replace(getLocale(), "")
    const allowedPages = [
      getLocale() + "/",
      getLocale(),
      getLocale() + "/about",
      getLocale() + "/feed",
      getLocale() + "/archive",
    ]

    // Include only specified pages for showing the selector
    if (allowedPages.includes(currentPath)) {
      const activeLink = document.querySelector(
        // @ts-ignore
        `a[href="${
          languageTag() === sourceLanguageTag
            ? currentPath
            : currentPath.endsWith("/")
            ? getLocale()
            : currentPath
        }"]`
      )

      if (activeLink) {
        const { x, width } = activeLink.getBoundingClientRect()

        // Adjustments for mobile screens
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 1024
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
    } else {
      // Hide the selector for non-allowed pages
      // @ts-ignore
      selector.current.classList.add("opacity-0")
    }
  }

  useLayoutEffect(() => {
    // On first render, wait for the selector to be rendered
    if (selectorPosition.x === 0 && selectorPosition.width === 0) {
      setTimeout(() => {
        handleSelector()
      }, 100)
    }

    requestAnimationFrame(() => {
      handleSelector()
    })

    // On resize, reposition the selector
    window.addEventListener("resize", handleSelector)

    return () => {
      window.removeEventListener("resize", handleSelector)
    }
  }, [pageContext])

  return (
    <div class="w-full flex items-center justify-between max-w-screen-lx mx-auto md:px-10 min-[350px]:px-4 xs:px-3">
      <div class="items-center flex-shrink-0 mr-6 hidden md:flex">
        <div
          onClick={() => {
            navigate(getLocale() + "/")
          }}
          class="group/all -ml-1 cursor-pointer"
        >
          <p class="text-lg font-medium group-hover/all:text-zinc-500 transition-colors relative dark:group-hover/all:text-zinc-400 ">
            <span class="group relative">Florian</span>
            <span class="text-base font-normal text-zinc-500 group-hover/all:text-zinc-400 ml-2 transition-colors hidden md:inline-block dark:group-hover/all:text-zinc-600">
              {m.name_title()}
            </span>
          </p>
        </div>
      </div>
      <div
        class="flex items-center md:gap-8 gap-2 justify-between md:justify-normal w-full md:w-auto lg:px-0 md:px-1.5 px-0"
        id="nav-links"
      >
        <NavigationLink
          href={
            languageTag() === sourceLanguageTag
              ? "/"
              : (getLocale() + "/").endsWith("/")
              ? getLocale()
              : "/"
          }
        >
          {m.navigation_home()}
        </NavigationLink>
        <NavigationLink href={getLocale() + "/about"}>
          {m.navigation_about()}
        </NavigationLink>
        <NavigationLink href={getLocale() + "/feed"}>
          {m.navigation_feed()}
        </NavigationLink>
        <NavigationLink href={getLocale() + "/archive"}>
          {m.navigation_archive()}
        </NavigationLink>
        {pageContext &&
          (languageTag() === sourceLanguageTag
            ? "/"
            : pageContext?.urlPathname.replace(getLocale(), "/") === "/" ||
              pageContext.urlPathname.replace(getLocale(), "") === "/about" ||
              pageContext.urlPathname.replace(getLocale(), "") === "/archive" ||
              pageContext.urlPathname.replace(getLocale(), "") === "/feed") && (
            <div
              ref={selector}
              style={{
                left: selectorPosition.x,
                width: selectorPosition.width,
              }}
              class="md:h-[1px] h-12 lg:-translate-x-0 md:-translate-x-8 translate-x-0 flex-shrink-0 absolute md:bottom-[-1px] bg-black opacity-0 rounded-full md:rounded-none dark:bg-white"
            />
          )}
      </div>
    </div>
  )
}

const NavigationLink = function (props: JSX.IntrinsicElements["a"]) {
  const pageContext = usePageContext()

  const className = [
    props.class,
    // @ts-ignore
    (pageContext?.urlPathname.replace(getLocale(), "") === ""
      ? "/" // @ts-ignore
      : pageContext?.urlPathname.replace(getLocale(), "")) ===
    // @ts-ignore
    (props.href.replace(getLocale(), "") === ""
      ? "/" // @ts-ignore
      : props.href.replace(getLocale(), ""))
      ? "md:text-black text-white relative z-10 before:opacity-0 dark:md:text-white dark:text-black"
      : "text-zinc-400 hover:text-black before:opacity-0 dark:hover:text-white",
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <a
      {...props}
      class={`${className} py-4 transition-colors duration-150 before:absolute group font-medium md:w-auto w-full text-center
      before:inset-x-0 before:-bottom-[3px] before:h-[1px] before:bg-black max-md:before:hidden relative z-10 text-sm xs:text-base`}
    />
  )
}
