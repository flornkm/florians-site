import Project from "@/components/template/Project"
import * as Icon from "react-feather"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bridge",
  description:
    "The intuitive tool that effortlessly enables you to craft and showcase job pages.",
}

export default function Bridge() {
  return (
    <Project
      projectTitle="Bridge"
      shortDescription="The intuitive tool that effortlessly enables you to craft and showcase job pages"
      bannerSource="/images/bridge/banner-bridge.webp"
      // collaborators={[]}
      projectMainDescription="Bridge is a browser-based software designed to provide an easy-to-use solution for creating job pages. It enables people to quickly create forms while not being forced to use an overcomplicated marketing platform that costs hundreds of dollars. Bridge also incorporates its own design token system, allowing for seamless auto-saves, real-time updates, and fast publishing of projects. This streamlined approach ensures that you can focus on crafting compelling job pages without any technical hindrances."
      slideImages={[
        "/images/bridge/bridge_landingpage.webp",
        "/images/bridge/bridge_colors.webp",
        "/images/bridge/bridge_preview.webp",
        "/images/bridge/bridge_waitlist.webp",
        "/images/bridge/bridge_k.webp",
      ]}
      processImage1="/images/bridge/bridge_dashboard.webp"
      processHeading1="Simple dashboard"
      processText1="I designed and developed a user-friendly dashboard that brings together essential tools and features in one place. The dashboard's primary goal was to streamline workflow and minimize time spent on switching between applications."
      processImage2="/images/bridge/bridge_popup.webp"
      processHeading2="States and alerts"
      processText2="To enhance user understanding and provide clear feedback within the system, I focused on implementing states and alerts throughout the project. For instance, when a user publishes a job page, a popup appears to confirm the action. This ensures that users are aware of the changes they are making."
      processImage3="/images/bridge/bridge_form.webp"
      processHeading3="Accessible and intuitive forms"
      processText3="I designed and developed the job pages consisting of a form that allows users to enter information related to the job opening. I focused on making the form as accessible and intuitive as possible, ensuring that users can easily navigate and complete it. The database is built on top of my own thought-through design token system, which allows for easy customization and scalability as well as real-time updates."
      processImage4="/images/bridge/bridge_submissions.webp"
      processHeading4="Submission management"
      processText4="For the submission management system, I focused on creating a simple and intuitive interface that allows users to easily manage and organize their submissions. This feature allows users to view and manage all submissions in one place, making it easier to keep track of the hiring process, as well as export the data."
      challenge="In today's job market, it often seems that companies either use Notion Boards or overly complicated platforms to post their job openings. This creates a dilemma for both employers and job seekers. I was curious about finding a solution that strikes a balance between the simplicity of a Notion Board and the flexibility of a complete marketing platform. To better understand this challenge, I conducted interviews with professionals working in growing companies."
      result="Bridge is a tool that allows companies to create and publish job pages in minutes. It is designed to be simple and intuitive, while also providing the flexibility to customize the page to match the company's brand. Bridge is currently in development, so feel free to reach out if you are interested in learning more about it."
      projectLinks={[
        {
          text: "Bridge",
          url: "https://bridge.supply/",
        },
        {
          text: "Product Hunt",
          url: "https://www.producthunt.com/posts/bridge-3bd70b3a-9dce-43be-9ebd-fd4ce780ab08",
        },
      ]}
      stack={[
        {
          name: "User Research",
          icon: <Icon.Users size={14} />,
          color: "text-blue-500 dark:text-blue-400",
          ringColor: "ring-blue-100 dark:ring-blue-800 dark:ring-opacity-30",
          backgroundColor: "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20",
        },
        {
          name: "Prototyping",
          icon: <Icon.Figma size={14} />,
          color: "text-blue-500 dark:text-blue-400",
          ringColor: "ring-blue-100 dark:ring-blue-800 dark:ring-opacity-30",
          backgroundColor: "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20",
        },
        {
          name: "User Testing",
          icon: <Icon.UserCheck size={14} />,
          color: "text-blue-500 dark:text-blue-400",
          ringColor: "ring-blue-100 dark:ring-blue-800 dark:ring-opacity-30",
          backgroundColor: "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20",
        },
        {
          name: "NextJS",
          icon: <Icon.Code size={14} />,
          color: "text-purple-500 dark:text-purple-400",
          ringColor:
            "ring-purple-100 dark:ring-purple-800 dark:ring-opacity-30",
          backgroundColor: "bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20",
        },
        {
          name: "Vercel",
          icon: <Icon.Server size={14} />,
          color: "text-purple-500 dark:text-purple-400",
          ringColor:
            "ring-purple-100 dark:ring-purple-800 dark:ring-opacity-30",
          backgroundColor: "bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20",
        },
        {
          name: "Design Token System",
          icon: <Icon.Camera size={14} />,
          color: "text-green-500 dark:text-green-400",
          ringColor: "ring-green-100 dark:ring-green-800 dark:ring-opacity-30",
          backgroundColor: "bg-green-50 dark:bg-green-900 dark:bg-opacity-20",
        },
        {
          name: "Supabase",
          icon: <Icon.Database size={14} />,
          color: "text-orange-500 dark:text-orange-400",
          ringColor:
            "ring-orange-100 dark:ring-orange-800 dark:ring-opacity-30",
          backgroundColor: "bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20",
        },
      ]}
    />
  )
}
