import { allProjects } from "contentlayer/generated"
import Navigation from "@/components/interface/Navigation"
import Footer from "@/components/interface/Footer"
import Project from "@/components/template/Project"

export const generateStaticParams = async () =>
  allProjects.map((project: any) => ({ slug: project._raw.flattenedPath }))

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const project = allProjects.find(
    (project: any) => project._raw.flattenedPath === "projects/" + params.slug
  )
  return { title: project?.title }
}

const ProjectLayout = ({ params }: { params: { slug: string } }) => {
  const project = allProjects.find(
    (project: any) => project._raw.flattenedPath === "projects/" + params.slug
  )

  if (project) {
    return (
      <>
        <Navigation title={project.title} />
        <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-transparent dark:text-white relative">
          <Project project={project} />
        </main>
        <Footer />
      </>
    )
  } else {
    return <h1>Project could not be found</h1>
  }
}

export default ProjectLayout
