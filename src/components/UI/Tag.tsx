export default function Tag(props: { key: number; children: JSX.Element }) {
  return (
    <div className="text-xs font-medium items-center text-[14px] px-2.5 py-1.5 border border-sky-100 rounded-full bg-sky-50 text-sky-500">
      {props.children}
    </div>
  )
}
