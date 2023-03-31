import Head from "next/head";
import * as React from "react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Image from "next/image";
import Popup from "@/components/Popup";

export default function Home() {
  const title = "Designer and Developer";
  const imgLoader = ({ src, width, quality }) => {
    return `/${src}?w=${width}&q=${quality || 75}`;
  };

  const highlight = "Concepts";
  const [popupState, setPopupState] = useState(false);

  React.useEffect(() => {
    if (popupState) {
      console.log("Popup is active");
    }
  }, [popupState]);

  const concepts = [
    {
      title: "Web Audit",
      description: "Raycast SEO Extension",
      icon: "./images/concept_icons/concept-icon_web-audit.svg",
    },
    {
      title: "Nutri",
      description: "Social Food App",
      icon: "./images/concept_icons/concept-icon_nutri.svg",
    },
    {
      title: "HeartbeatOS",
      description: "Heart Simulator & Monitoring",
      icon: "./images/concept_icons/concept-icon_heartbeat.svg",
    },
    {
      title: "Stackoverflow",
      description: "Redesign & Extension",
      icon: "./images/concept_icons/concept-icon_stackoverflow.svg",
    },
    {
      title: "Visualization",
      description: "ThreeJS Data Visualization",
      icon: "./images/concept_icons/concept-icon_visualization.svg",
    },
  ];

  const currentConcept = React.useRef({
    collaborators: null,
    title: null,
    shortDescription: null,
    icon: null,
    mainImages: [null, null],
    text: null,
    links: null,
  });

  const activatePopup = (concept) => {
    if (concept.title === "Nutri") {
      currentConcept.current.collaborators = ["Anton", "Nils"];
      currentConcept.current.title = "Nutri";
      currentConcept.current.shortDescription = "Social Food App";
      currentConcept.current.icon =
        "./images/concept_icons/concept-icon_nutri.svg";
      currentConcept.current.video = null;
      currentConcept.current.mainImages = [
        "./images/nutri/nutri_mockup.jpg",
        "./images/nutri/nutri_double_diamond.jpg",
        "./images/nutri/nutri_phone.jpg",
      ];
      currentConcept.current.text =
        "Nutri is an innovative social food and recipe app concept that aims to transform the user experience of recipe applications. Unlike other recipe apps, Nutri has undergone a rigorous research and testing process, utilizing modern design thinking methods such as the double diamond method to identify user needs and solve real-world problems. The Nutri prototype has been designed with a specific target audience in mind - young people living in shared apartments. The app features a completely redesigned and user-friendly interface, offering an engaging recipe process that is reminiscent of a story on a social network.";
      currentConcept.current.links = [
        {
          text: "View Prototype",
          url: "https://www.figma.com/proto/tO5jcdD8IQBqJ6M6atsSHg/Designmethoden-Prototypen?page-id=0%3A1&node-id=1%3A7&viewport=-126%2C337%2C0.16&scaling=scale-down&starting-point-node-id=1%3A7&show-proto-sidebar=1",
        },
      ];
    } else if (concept.title === "Stackoverflow") {
      currentConcept.current.collaborators = ["Nils"];
      currentConcept.current.title = "Stackoverflow";
      currentConcept.current.shortDescription = "Redesign & Extension";
      currentConcept.current.icon =
        "./images/concept_icons/concept-icon_stackoverflow.svg";
      currentConcept.current.video = null;
      currentConcept.current.mainImages = [
        "./images/stackoverflow/stackoverflow_redesign.jpg",
        "./images/stackoverflow/stackoverflow_extension.jpg",
        "./images/stackoverflow/stackoverflow_mockup.jpg",
      ];
      currentConcept.current.text =
        "At the core of our project is a redesign of the Stack Overflow website, which is a popular online community for programmers seeking solutions to complex coding issues. Our redesign offers a refreshed and user-friendly interface, making it easier for programmers to navigate the site and find solutions to their problems quickly. Our redesign was based on extensive research, user surveys, and testing to identify user needs and ensure a seamless user experience. Additionally, we developed a bug-fixing extension for Visual Studio Code that allows developers to easily detect and correct errors in their code. This extension is a game-changer for developers, as it streamlines the debugging process and saves valuable time and effort.";
      currentConcept.current.links = [
        {
          text: "View Prototype",
          url: "https://www.figma.com/proto/UIh7ItWTGGOeEmcRwNq9Of/stackoverflow_redesign?page-id=218%3A884&node-id=427%3A1477&viewport=330%2C-71%2C0.02&scaling=scale-down&starting-point-node-id=427%3A1477&show-proto-sidebar=1",
        },
      ];
    } else if (concept.title === "Visualization") {
      currentConcept.current.collaborators = ["Nils"];
      currentConcept.current.title = "Visualization";
      currentConcept.current.shortDescription = "ThreeJS Data Visualization";
      currentConcept.current.icon =
        "./images/concept_icons/concept-icon_visualization.svg";
      currentConcept.current.video = null;
      currentConcept.current.mainImages = [
        "./images/visualization/visualization_website.jpg",
        "./images/visualization/visualization_colors.jpg",
        "./images/visualization/visualization_options.jpg",
      ];
      currentConcept.current.text =
        "In this project, we utilized the power of ThreeJS to create a data visualization of homicides from around the world. Our goal was to create an impactful visualization that highlights patterns and trends in the data and provides a global perspective on this important issue. We worked with real-world data to create a visualization that uses different layers, including colors and heights, to represent homicide rates. Through this approach, we were able to create an interactive and engaging experience that allows users to explore the data in a unique and meaningful way.";
      currentConcept.current.links = [
        {
          text: "Visualization Website",
          url: "https://homicides-visualization.designwithtech.com/",
        },
      ];
    } else if (concept.title === "HeartbeatOS") {
      currentConcept.current.collaborators = ["Anton"];
      currentConcept.current.title = "HeartbeatOS";
      currentConcept.current.shortDescription = "Heart Simulator & Monitoring";
      currentConcept.current.icon =
        "./images/concept_icons/concept-icon_heartbeat.svg";
      currentConcept.current.video = null;
      currentConcept.current.mainImages = [
        "./images/heartbeat/heartbeat_mockup.jpg",
        "./images/heartbeat/heartbeat_interface.jpg",
        "./images/heartbeat/heartbeat_documentation.jpg",
      ];
      currentConcept.current.text =
        "A heartbeat sensor and pulse sensor communication system that utilizes cutting-edge technology to establish a seamless connection between the two devices. Our project is built on Microsoft Azure Services, offering a reliable and secure foundation for this innovative communication system.";
      currentConcept.current.links = [
        {
          text: "Frontend",
          url: "https://heartbeat-frontend.azurewebsites.net/",
        },
        {
          text: "Documentation",
          url: "https://heartbeat-documentation.vercel.app/",
        },
      ];
    } else if (concept.title === "Web Audit") {
      currentConcept.current.collaborators = [""];
      currentConcept.current.title = "Web Audit";
      currentConcept.current.shortDescription = "Raycast SEO Extension";
      currentConcept.current.icon =
        "./images/concept_icons/concept-icon_web-audit.svg";
      currentConcept.current.video =
        "https://www.youtube.com/embed/hMlDm9P88nY?autoplay=1&mute=1&loop=1";
      currentConcept.current.videoThumbnail =
        "./images/web_audit/web-audit_thumbnail.jpg";
      currentConcept.current.mainImages = [
        "./images/web_audit/web-audit_analyze.jpg",
        "./images/web_audit/web-audit_score.jpg",
        "./images/web_audit/web-audit_info.jpg",
      ];
      currentConcept.current.text =
        "A Raycast extension that allows users to quickly and easily perform a website audit. The extension provides a comprehensive overview of a website's SEO performance.";
      currentConcept.current.links = [
        {
          text: "Raycast Store",
          url: "https://www.raycast.com/floriandwt/web-audit",
        },
        {
          text: "GitHub",
          url: "https://github.com/floriandwt/web-audit-extension",
        },
      ];
    }
    setPopupState(true);
  };

  return (
    <>
      <Head>
        <title>About Florian | Design With Tech</title>
        <meta
          name="description"
          content="Designer and Developer building digital products."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Combining Design and Technology | Design With Tech"
        />
        <meta
          property="og:description"
          content="Designer and Developer building digital products."
        />
        <meta
          property="og:image"
          content="/images/designwithtech_opengraph.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@floriandwt" />
        <meta name="twitter:title" content="Florian Portfolio" />
        <meta
          name="twitter:image"
          content="/images/designwithtech_twitter.jpg"
        />
        <meta
          name="twitter:description"
          content="Designer and Developer building digital products."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation title={title} highlight={highlight} />
      <main className="max-md:w-[90%] min-h-[100vh] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-[#080D14] dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 mb-8">
          <h1 className="text-3xl font-semibold text-left mb-3">Concepts</h1>
          <h2 className="text-xl font-medium text-left text-gray-500">
            Smaller creations and ideas.
          </h2>
        </div>
        <div className="min-h-96 flex flex-col place-items-start w-full gap-4">
          {concepts.map((concept, index) => (
            <div
              key={index}
              onClick={() => {
                activatePopup(concept);
              }}
              className="bg-transparent rounded-2xl flex justify-center place-items-center"
            >
              <div className="cursor-pointer transition-all hover:bg-gray-100 flex flex-row gap-4 justify-start px-4 py-3 rounded-lg place-items-center text-gray-600 hover:text-black relative -left-4 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800">
                <Image
                  loader={imgLoader}
                  src={concept.icon}
                  alt="Nutri Blueprint Icon"
                  className="rounded-xl"
                  width={48}
                  height={48}
                />
                <div>
                  <p className="text-lg font-medium text-ellipsis">{concept.title}</p>
                  <p className="text-base text-ellipsis">{concept.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Popup
          collaborators={currentConcept.current.collaborators}
          popupState={popupState}
          setPopupState={setPopupState}
          icon={currentConcept.current.icon}
          name={currentConcept.current.title}
          shortDescription={currentConcept.current.shortDescription}
          mainImages={currentConcept.current.mainImages}
          text={currentConcept.current.text}
          links={currentConcept.current.links}
          video={currentConcept.current.video}
          videoThumbnail={currentConcept.current.videoThumbnail}
        />
      </main>
      <Footer />
    </>
  );
}
