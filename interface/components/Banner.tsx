export default function Banner(props: { children: string }) {
  return (
    <div class="flex justify-center py-2 bg-gradient-to-tr border-b bg-rose-500 border-b-rose-700 text-white px-6 dark:bg-rose-600 dark:border-b-rose-500">
      {props.children}
    </div>
  )
}
