import Head from "next/head";
import * as React from "react";
import { NextSeo } from "next-seo";
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

  const highlight = "Creations";
  const [popupState, setPopupState] = useState(false);

  React.useEffect(() => {
    if (popupState) {
      console.log("Popup is active");
    }
  }, [popupState]);

  const concepts = [
    {
      title: "Granny AI",
      description: "AI Hackathon Project",
      icon: "./images/icons/granny_ai_icon.jpg",
      preview: "./images/granny_ai/granny_ai_preview.png",
    },
    {
      title: "Web Audit",
      description: "Raycast SEO Extension",
      icon: "./images/icons/web_audit_icon.jpg",
      preview: "./images/web_audit/web-audit_preview.png",
    },
    {
      title: "Nutri",
      description: "Social Food App",
      icon: "./images/icons/nutri_icon.jpg",
      preview: "./images/nutri/nutri_preview.png",
    },
    {
      title: "HeartbeatOS",
      description: "Heart Simulator & Monitoring",
      icon: "./images/icons/heartbeatos_icon.jpg",
      preview: "./images/heartbeat/heartbeat_preview.png",
    },
    {
      title: "Stackoverflow",
      description: "Redesign & Extension",
      icon: "./images/icons/stackoverflow_icon.jpg",
      preview: "./images/stackoverflow/stackoverflow_preview.png",
    },
    {
      title: "Visualization",
      description: "ThreeJS Data Visualization",
      icon: "./images/icons/visualization_icon.jpg",
      preview: "./images/visualization/visualization_preview.png",
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
      "./images/icons/nutri_icon.jpg";
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
        "./images/icons/stackoverflow_icon.jpg";
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
        "./images/icons/visualization_icon.jpg";
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
        "./images/icons/heartbeatos_icon.jpg";
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
      "./images/icons/web_audit_icon.jpg";
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
    } else if (concept.title === "Granny AI") {
      currentConcept.current.collaborators = ["Anton"];
      currentConcept.current.title = "Granny AI";
      currentConcept.current.shortDescription = "AI Chatbot for Shopping made in 48h";
      currentConcept.current.icon =
        "./images/icons/granny_ai_icon.jpg";
      currentConcept.current.video = null;
      currentConcept.current.mainImages = [
        "./images/granny_ai/granny_ai_figma.jpg",
        "./images/granny_ai/granny_ai_interface.jpg",
        "./images/granny_ai/granny_ai_popup.jpg",
      ];
      currentConcept.current.text =
        "Grandmas have always the best advice. Granny AI is a really quick developed AI bot that helps you with your decisions. In this case, Granny gives you suggestions on what clothes to buy. Granny AI was written in React / NextJS and uses the GPT-3 API from OpenAI and Elevenlabs, the Frontend was built with Tailwind CSS. The project was developed in 48 hours during a hackathon. The project is an MVP and is not ready for production.";
      currentConcept.current.links = [
        {
          text: "View and Test (on own risk)",
          url: "https://granny-ai.vercel.app/",
        },
      ];
    }

    setPopupState(true);
  };

  return (
    <>
      <NextSeo
        title="Creations - Florian"
        description="Some creations from small to big I have worked on."
        openGraph={{
          url: 'floriandwt.com',
          title: 'Creations - Florian',
          description: 'Some creations from small to big I have worked on.',
          images: [
            {
              url: '/images/designwithtech_opengraph.jpg',
              width: 800,
              height: 600,
              alt: 'Florian - Digtital Product Designer',
              type: 'image/jpeg',
            }
          ],
          siteName: 'Florian - Digtital Product Designer',
        }}
        twitter={{
          handle: '@floriandwt',
          site: '@floriandwt',
          cardType: 'summary_large_image',
        }}
      />
      <Navigation title={title} highlight={highlight} />
      <main className="max-md:w-[90%] min-h-[100vh] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-[#101012] dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 mb-8">
          <h1 className="text-3xl font-semibold text-left mb-3">Creations</h1>
          <h2 className="text-xl font-medium text-left text-zinc-400">
            A selection of ideas, concepts and more.
          </h2>
        </div>
        <div className="min-h-96 grid grid-cols-3 w-full gap-4 max-md:grid-cols-1 max-lg:grid-cols-2 pb-32">
          {concepts.map((concept, index) => (
            <div
              key={index}
              onClick={() => {
                activatePopup(concept);
              }}
              className={"bg-transparent rounded-2xl flex h-full w-full " + (concept.title === "Granny AI" ? "md:col-span-2 md:row-span-2" : "")}
            >
              <div className="cursor-pointer transition-all h-full group dark:hover:bg-opacity-80 hover:bg-opacity-80 bg-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:bg-[#131314] w-full flex flex-col gap-4 max-md:justify-center md:justify-end px-4 py-3 rounded-lg group">
                <Image
                  loader={imgLoader}
                  src={concept.preview ? concept.preview : concept.icon}
                  alt="Nutri Blueprint Icon"
                  className="rounded-xl w-full transition-all"
                  width={500}
                  height={300}
                />
                <div>
                  <p className="text-base font-medium text-ellipsis transition-all text-black dark:text-white">{concept.title}</p>
                  <p className="text-sm text-ellipsis transition-all text-zinc-500 dark:text-zinc-400">{concept.description}</p>
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
