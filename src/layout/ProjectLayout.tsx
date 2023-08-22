export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full grid grid-cols-3">
      <div className="col-start-2 col-span-2">
        {
          // only render content from children if its not headings
          children
        }
      </div>
    </div>
  )
}
