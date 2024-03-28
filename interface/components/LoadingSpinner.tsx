export default function LoadingSpinner(props: {
  message?: string
  class?: string
}) {
  return (
    <div
      class={
        "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-12 h-12 bg-neutral-100 z-40 dark:bg-black " +
        props.class
      }
    >
      <div class="h-full w-full aspect-square rounded-full border-4 border-black animate-spin dark:border-white mb-10">
        <div class="w-2/3 h-2/3 absolute z-50 bg-neutral-100 -top-2 -left-2 dark:bg-black" />
      </div>
      {props.message && (
        <p class="text-center text-sm absolute truncate left-1/2 -translate-x-1/2 py-1 px-2 rounded-md bg-neutral-100 animate-pulse dark:bg-neutral-900">
          {props.message}
        </p>
      )}
    </div>
  )
}
