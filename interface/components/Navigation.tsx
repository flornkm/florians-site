import { JSX } from "preact/jsx-runtime"
import { usePageContext } from "../../renderer/usePageContext"
import { useRef, useState, useLayoutEffect, useMemo } from "preact/hooks"
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
      getLocale() + "/colophon",
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
          typeof window !== "undefined" && window.innerWidth < 768
        const mobileWidthFactor = 1.2

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

  const aiMode = useMemo(() => {
    return pageContext?.urlPathname.replace(getLocale(), "") === "/ai"
  }, [pageContext])

  return (
    <div class="w-full flex lg:grid lg:grid-cols-5 items-center justify-between max-w-screen-3xl mx-auto md:px-10 min-[650px]:px-5 min-[400px]:px-3.5 xs:px-3">
      <div class="items-center flex-shrink-0 mr-6 hidden md:flex">
        <div
          onClick={() => {
            if (typeof window !== "undefined")
              document.body.style.overflow = "auto"
            navigate(getLocale() + "/")
          }}
          class="group/all -ml-1 cursor-pointer"
        >
          <p class="text-lg font-medium group-hover/all:text-neutral-500 transition-colors relative dark:group-hover/all:text-neutral-400 ">
            <span class="group relative">
              {aiMode ? "Florian AI" : "Florian"}
            </span>
            <span class="text-base font-normal text-neutral-500 group-hover/all:text-neutral-400 ml-2 transition-colors hidden xl:inline-block dark:group-hover/all:text-neutral-600">
              {aiMode ? "Experimental" : m.name_title()}
            </span>
          </p>
        </div>
      </div>
      <div
        class={
          "flex items-center transition-opacity col-span-3 lg:gap-4 md:gap-3 gap-1.5 justify-between md:max-w-[calc(432px+(6px*5))] mx-auto truncate md:justify-between w-full lg:px-0 md:px-1.5 px-0 " +
          (aiMode ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100")
        }
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
        <NavigationLink
          href={getLocale() + "/colophon"}
          class="hidden md:block"
        >
          {m.site_info()}
        </NavigationLink>
        {pageContext &&
          (languageTag() === sourceLanguageTag
            ? "/"
            : pageContext?.urlPathname.replace(getLocale(), "/") === "/" ||
              pageContext.urlPathname.replace(getLocale(), "") === "/about" ||
              pageContext.urlPathname.replace(getLocale(), "") === "/archive" ||
              pageContext.urlPathname.replace(getLocale(), "") === "/feed" ||
              pageContext.urlPathname.replace(getLocale(), "") ===
                "/colophon") && (
            <div
              ref={selector}
              style={{
                left: selectorPosition.x,
                width: selectorPosition.width,
              }}
              class="md:h-9 h-12 md:-translate-x-[50%] lg:-translate-x-0 lg:px-0 xs:translate-x-[5%] -translate-x-0.5 flex-shrink-0 absolute md:bg-neutral-100 bg-black opacity-0 rounded-full md:rounded-md dark:bg-white dark:md:bg-neutral-900"
            />
          )}
      </div>
      <div class="w-full h-full hidden items-center justify-end lg:flex">
        <AiSwitch />
      </div>
    </div>
  )
}

export const AiSwitch = function () {
  const pageContext = usePageContext() as any

  const aiMode = useMemo(() => {
    return pageContext?.urlPathname.replace(getLocale(), "") === "/ai"
  }, [pageContext])

  return (
    <button
      class="font-medium flex items-center gap-2 group truncate"
      onClick={() => {
        if (pageContext?.urlPathname.replace(getLocale(), "") === "/ai") {
          navigate(getLocale() + "/")
          document.body.style.overflow = "auto"
        } else navigate(getLocale() + "/ai")
      }}
    >
      <>
        AI Mode
        <div class="bg-neutral-200 rounded-full h-5 w-8 relative flex items-center group-hover:bg-neutral-300 transition-colors duration-100 dark:bg-neutral-700 dark:group-hover:bg-neutral-600">
          <div
            class={
              "h-4 aspect-square rounded-full transition-all duration-100 " +
              (aiMode
                ? "bg-neutral-900 ml-3.5 dark:bg-neutral-100"
                : "bg-white ml-0.5 dark:bg-neutral-900")
            }
          />
        </div>
      </>
    </button>
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
      : "text-neutral-400 hover:text-black before:opacity-0 dark:hover:text-white",
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <a
      {...props}
      class={`${className} py-4 md:px-4 transition-colors max-lg:truncate duration-150 before:absolute group font-medium md:w-auto w-full text-center
      before:inset-x-0 before:-bottom-[3px] before:h-[1px] before:bg-black max-md:before:hidden relative z-10 text-sm xs:text-base`}
    />
  )
}
