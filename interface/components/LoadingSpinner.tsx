export default function LoadingSpinner(props: { class?: string }) {
  return (
    <div
      class={
        "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-16 h-16 bg-light-zinc z-50 dark:bg-black " +
        props.class
      }
    >
      <div class="h-full w-full aspect-square rounded-full border-4 border-black animate-spin dark:border-white">
        <div class="w-2/3 h-2/3 absolute z-50 bg-light-zinc -top-2 -left-2 dark:bg-black" />
      </div>
    </div>
  )
}
