import { Ref } from "preact"

export function changeTitleColor(element: HTMLHeadingElement) {
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", ({ matches }) => {
      if (matches) {
        // @ts-ignore
        element.style.color = "black"
      }
    })

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", ({ matches }) => {
      if (matches) {
        // @ts-ignore
        element.style.color = "white"
      }
    })
}
