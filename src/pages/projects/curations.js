import Project from "@/components/Project";

export default function Curations() {
  return (
    <Project
      projectTitle="Curations"
      shortDescription="A curated collection of the best products on the web"
      bannerSource="./images/curations/banner-curations.jpg"
      collaborators={["Anton", "Nils"]}
      projectMainDescription="During our time at university, my team and I recognized the significance of tools in our daily lives and conceived the idea of curating a collection of such tools. We began with a modest Notion database-page containing a limited number of tools, but we aspired to share our collection with a wider audience in an easily accessible way. To achieve this goal, we leveraged the Notion API and developed a website that displays our curated collection and allows users to submit their own discoveries. Our team of curators carefully selects each tool before it is deployed to the public, ensuring the highest quality recommendations. As a result, our platform has enabled thousands of individuals to discover new and innovative tools, gain inspiration, and much more."
      slideImages={[
        "./images/curations/cuations_details.webp",
        "./images/curations/curations_cards.webp",
        "./images/curations/curations_in_use.webp",
        "./images/curations/curations_wireframe.webp",
        "./images/curations/curations_update.webp",
      ]}
      processImage1="./images/curations/curations_ideas.jpg"
      processHeading1="Generating ideas"
      processText1="During the initial stages of our project, my colleagues Anton, Nils, and I brainstormed a variety of ideas, ranging from a platform with intricate navigation to a minimalist one-pager featuring only a few essential links. We engaged in extensive discussions, as well as sketching and designing, to explore and refine these diverse concepts."
      processImage2="./images/curations/curations_collection.jpg"
      processHeading2="The collection"
      processText2="At Curations, our team of experienced curators has carefully organized an extensive collection of tools across multiple categories. Our collection is divided into various categories, including design, development, productivity, and more. Within each of these categories, we have created subcategories to make it easier for users to navigate and find the specific tools they need. For instance, under the design category, we have subcategories such as tools, portfolios, and inspiration. Similarly, our development category contains subcategories such as frameworks, repositories, and coding info. Our productivity category has subcategories like analytics, surveys, and mac apps."
      processImage3="./images/curations/curations_prototype.jpg"
      processHeading3="Testing our prototype"
      processText3="In the spring of 2022, we launched version 1 of Curations, utilizing Webflow and their CMS. Although the Content Management System (CMS) was initially suitable for managing a small number of cards, we quickly realized its limitations when it came to manually inserting every link, image, and text. Consequently, we recognized the need to transition to more robust and scalable technologies."
      processImage4="./images/curations/curations_site.jpg"
      processHeading4="The Gateway to Innovative Tools"
      processText4="Leveraging NextJS, we successfully established a connection to our existing Notion page, which already contained a vast collection of links. Additionally, we made the strategic decision to release the project as open-source, not only to assist others encountering similar challenges and seeking solutions but also to enable the community to contribute to its development. In November of 2022, we launched the site on ProductHunt, which proved to be a major success. Through the help of newsletters, Twitter followers, and the ProductHunt platform, we were able to reach nearly 10,000 users within the first launch. Moving forward, our plan is to expand the project beyond just a curated list of links, providing users with even greater value and utility."
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
    />
  );
}
