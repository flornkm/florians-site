export default function LoadingSpinner(props: {
  message?: string
  class?: string
  invert?: boolean
  thin?: boolean
}) {
  return (
    <div
      class={
        "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-12 h-12 z-40 " +
        (props.invert
          ? "bg-neutral-900 dark:bg-neutral-100"
          : "bg-neutral-100 dark:bg-neutral-900") +
        " " +
        (props.class ? props.class : "")
      }
    >
      <div
        class={
          "h-full w-full aspect-square rounded-full " +
          (props.invert
            ? "border-white dark:border-neutral-900"
            : "border-neutral-900 dark:border-white") +
          " animate-spin mb-10 " +
          (props.thin ? "border-2" : "border-4")
        }
      >
        <div
          class={
            "w-2/3 h-2/3 absolute z-50 " +
            (props.invert
              ? "bg-neutral-900 dark:bg-neutral-100"
              : "bg-neutral-100 dark:bg-neutral-900") +
            " -top-2 -left-2"
          }
        />
      </div>
      {props.message && (
        <p
          class={
            "text-center text-sm absolute truncate left-1/2 -translate-x-1/2 py-1 px-2 rounded-md animate-pulse " +
            (props.invert
              ? "bg-black dark:bg-neutral-900 text-white"
              : "bg-neutral-100 dark:bg-neutral-900")
          }
        >
          {props.message}
        </p>
      )}
    </div>
  )
}
