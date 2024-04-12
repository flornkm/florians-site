import Work from "#sections/Work"

export default function Page({ projects }: { projects: any[] }) {
  return (
    <section class="pt-4 pb-16">
      <Work projects={projects} />
    </section>
  )
}
