import { JSX, VNode } from "preact"

export default function NoPrerender(
  props: { children: Element | VNode } & JSX.HTMLAttributes
) {
  return typeof window === undefined ? null : <>{props.children}</>
}
