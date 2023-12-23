import Work from "#sections/Work"

export default function Page({ projects }: { projects: any[] }) {
  return (
    <section class="pt-16">
      <Work projects={projects} />
    </section>
  )
}
