import Project from "@/components/Project";

export default function Boost() {
  return (
    <Project
      projectTitle="Curations"
      shortDescription="A curated collection of the best products on the web"
      bannerSource="./images/banner-curations.jpg"
      collaborators={["Anton", "Nils"]}
      projectMainDescription="During our time at university, my team and I recognized the significance of tools in our daily lives and conceived the idea of curating a collection of such tools. We began with a modest Notion database-page containing a limited number of tools, but we aspired to share our collection with a wider audience in an easily accessible way. To achieve this goal, we leveraged the Notion API and developed a website that displays our curated collection and allows users to submit their own discoveries. Our team of curators carefully selects each tool before it is deployed to the public, ensuring the highest quality recommendations. As a result, our platform has enabled thousands of individuals to discover new and innovative tools, gain inspiration, and much more."
      slideImages={[
        "./images/boost_app_in_hand.webp",
        "./images/boost_application.webp",
        "./images/boost_detail.webp",
        "./images/boost_full_device.webp",
        "./images/boost_in_use.webp",
      ]}
      processImage1="./images/boost_research.webp"
      processHeading1="Generating ideas"
      processText1="During the initial stages of our project, my colleagues Anton, Nils, and I brainstormed a variety of ideas, ranging from a platform with intricate navigation to a minimalist one-pager featuring only a few essential links. We engaged in extensive discussions, as well as sketching and designing, to explore and refine these diverse concepts."
      processImage2="./images/boost_vertical_prototype.webp"
      processHeading2="Vertical Prototyping"
      processText2="In the vertical prototyping phase, we had to create a hardware
      prototype that is close to the final prototype. The goal was
      to test the hardware and see if it works as intended. We
      started by testing different motors and found out that the
      Nema 17 stepper motor was the best option for our prototype.
      We also had to send and receive data from a quickly made
      Frontend to the Backend. We used the Arduino IDE to program an
      ESP32 and used a NodeJS Express server to receive the data. We
      also made a quick Frontend to send the data to the Backend.
      Our tech stack for the project was made clear, we were going
      to use Ionic React for the Frontend, NodeJS Express for the
      Backend, and Prisma for the database."
      processImage3="./images/boost_app.webp"
      processHeading3="The first release"
      processText3="In the spring of 2022, we launched version 1 of Curations, utilizing Webflow and their CMS. Although the Content Management System (CMS) was initially suitable for managing a small number of cards, we quickly realized its limitations when it came to manually inserting every link, image, and text. Consequently, we recognized the need to transition to more robust and scalable technologies."
      processImage4="./images/boost_device.webp"
      processHeading4="The Gateway to Innovative Tools"
      processText4="Leveraging React-Notion-X, we successfully established a connection to our existing Notion page, which already contained a vast collection of links. Additionally, we made the strategic decision to release the project as open-source, not only to assist others encountering similar challenges and seeking solutions but also to enable the community to contribute to its development. In November of 2022, we launched the site on ProductHunt, which proved to be a major success. Through the help of newsletters, Twitter followers, and the ProductHunt platform, we were able to reach nearly 10,000 users within the first launch. Moving forward, our plan is to expand the project beyond just a curated list of links, providing users with even greater value and utility."
      projectLinks={[
        {
          text: "Curations",
          url: "https://www.curations.tech/",
        },
      ]}
    />
  );
}
