export default function Tag(props: { key: number; children: JSX.Element }) {
  return (
    <div className="text-xs font-medium items-center text-[14px] px-2.5 py-1.5 rounded-full border border-primary/25 bg-primary/20 text-primary">
      {props.children}
    </div>
  )
}
