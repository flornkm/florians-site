import { JSX } from "preact/jsx-runtime"
import { usePageContext } from "./usePageContext"

export { Link }

const Link = function (props: JSX.IntrinsicElements["a"]) {
  const pageContext = usePageContext()
  const className = [
    props.className,
    // @ts-ignore
    pageContext.urlPathname === props.href && "is-active",
  ]
    .filter(Boolean)
    .join(" ")
  return <a {...props} className={className} />
}
