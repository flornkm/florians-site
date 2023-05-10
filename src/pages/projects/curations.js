import Project from "@/components/Project";
import * as Icon from "react-feather";

export default function Curations() {
  return (
    <Project
      projectTitle="Curations"
      shortDescription="A curated collection of the best products on the web"
      bannerSource="./images/curations/banner-curations.webp"
      collaborators={["Anton", "Nils"]}
      projectMainDescription="In university, my team recognized the value of tools in our daily lives and decided to create a collection of them. We started with a Notion database-page, but wanted to share it more widely. Using the Notion API, we developed a website where users can view our curated collection and submit their own discoveries. Our curators meticulously select each tool, guaranteeing the best recommendations. Our platform has helped countless individuals find new and innovative tools and gain inspiration.      "
      slideImages={[
        "./images/curations/cuations_details.webp",
        "./images/curations/curations_cards.webp",
        "./images/curations/curations_in_use.webp",
        "./images/curations/curations_wireframe.webp",
        "./images/curations/curations_update.webp",
      ]}
      processImage1="./images/curations/curations_ideas.webp"
      processHeading1="Generating ideas"
      processText1="During the initial stages of our project, my colleagues Anton, Nils, and I brainstormed a variety of ideas, ranging from a platform with intricate navigation to a minimalist one-pager featuring only a few essential links. We engaged in extensive discussions, as well as sketching and designing, to explore and refine these diverse concepts."
      processImage2="./images/curations/curations_collection.webp"
      processHeading2="The collection"
      processText2="At Curations, our team of experienced curators has carefully organized an extensive collection of tools across multiple categories. Our collection is divided into various categories, including design, development, productivity, and more. Within each of these categories, we have created subcategories to make it easier for users to navigate and find the specific tools they need. For instance, under the design category, we have subcategories such as tools, portfolios, and inspiration. Similarly, our development category contains subcategories such as frameworks, repositories, and coding info. Our productivity category has subcategories like analytics, surveys, and mac apps."
      processImage3="./images/curations/curations_prototype.webp"
      processHeading3="Testing our prototype"
      processText3="In the spring of 2022, we launched version 1 of Curations, utilizing Webflow and their CMS. Although the Content Management System (CMS) was initially suitable for managing a small number of cards, we quickly realized its limitations when it came to manually inserting every link, image, and text. Consequently, we recognized the need to transition to more robust and scalable technologies."
      processImage4="./images/curations/curations_site.webp"
      processHeading4="The Gateway to Innovative Tools"
      processText4="Leveraging NextJS, Supabase and Vercel, we developed a website that displays our curated collection and allows users to submit their own discoveries. Our team of curators carefully selects each tool before it is deployed to the public, ensuring the highest quality recommendations."
      challenge="Our browsers are full of tabs, our bookmarks are full of links, and our notes are full of ideas. We needed a platform that would allow us to organize and share our discoveries with others."
      result="Curations had a successfull launch on ProductHunt, reaching nearly 10,000 users within the first month. Moving forward, our plan is to expand the project beyond just a curated list of links, providing users with even greater value and utility."
      projectLinks={[
        {
          text: "Curations",
          url: "https://www.curations.tech/",
        },
        {
          text: "Product Hunt",
          url: "https://www.producthunt.com/products/curations",
        },
        {
          text: "GitHub Repo",
          url: "https://github.com/floriandwt/Curations",
        },
      ]}
      stack={[
        {
          name: "User Research",
          icon: <Icon.Users size={14} />,
          color: "text-blue-500 dark:text-blue-400",
          ringColor: "ring-blue-100 dark:ring-blue-800 dark:ring-opacity-30",
          backgroundColor: "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20"
        },
        {
          name: "Prototyping",
          icon: <Icon.Figma size={14} />,
          color: "text-blue-500 dark:text-blue-400",
          ringColor: "ring-blue-100 dark:ring-blue-800 dark:ring-opacity-30",
          backgroundColor: "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20"
        },
        {
          name: "NextJS",
          icon: <Icon.Code size={14} />,
          color: "text-purple-500 dark:text-purple-400",
          ringColor: "ring-purple-100 dark:ring-purple-800 dark:ring-opacity-30",
          backgroundColor: "bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20"
        },
        {
          name: "Vercel",
          icon: <Icon.Server size={14} />,
          color: "text-purple-500 dark:text-purple-400",
          ringColor: "ring-purple-100 dark:ring-purple-800 dark:ring-opacity-30",
          backgroundColor: "bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20"
        },
        {
          name: "Custom Screenshot API",
          icon: <Icon.Camera size={14} />,
          color: "text-green-500 dark:text-green-400",
          ringColor: "ring-green-100 dark:ring-green-800 dark:ring-opacity-30",
          backgroundColor: "bg-green-50 dark:bg-green-900 dark:bg-opacity-20"
        },
        {
          name: "Supabase",
          icon: <Icon.Database size={14} />,
          color: "text-orange-500 dark:text-orange-400",
          ringColor: "ring-orange-100 dark:ring-orange-800 dark:ring-opacity-30",
          backgroundColor: "bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20"
        }
      ]}
    />
  );
}
