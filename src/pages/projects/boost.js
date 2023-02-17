import Project from "@/components/Project";

export default function Boost() {
  return (
    <Project
      projectTitle="Boost"
      shortDescription="Nutrition application & hardware device"
      bannerSource="./images/boost/banner-boost.jpg"
      collaborators={["Anton"]}
      projectMainDescription="Boost is a prototype of an innovative digital product and app
      designed and developed with Ionic React, NodeJS Express, and Prisma.
      The product seamlessly integrates with the app, allowing users to
      track their daily nutrient intake and receive personalized
      recommendations based on factors such as weather and step count. As
      a digital product designer, I had the opportunity to work on Boost's
      prototype and develop its design, ensuring a seamless user
      experience."
      slideImages={[
        "./images/boost/boost_app_in_hand.webp",
        "./images/boost/boost_application.webp",
        "./images/boost/boost_detail.webp",
        "./images/boost/boost_full_device.webp",
        "./images/boost/boost_in_use.webp",
      ]}
      processImage1="./images/boost/boost_research.webp"
      processHeading1="Research"
      processText1="First of all, we had to make a survey to find out what people
      thought about the current state of the nutrition industry. We
      also had the intention of finding out what people are taking
      as supplements and in what form. Our survey was made with the
      help of Airtable so we could easily analyze the data
      afterwards. In our research we found out that people are
      taking supplements in the form of pills, powders, and liquids,
      but when they could choose, they would prefer to take them in
      the form of a drink or powder because it is more convenient."
      processImage2="./images/boost//boost_vertical_prototype.webp"
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
      processImage3="./images/boost/boost_app.webp"
      processHeading3="Frontend"
      processText3="When researching and discussing our Frontend, we came to the
      conclusion that it would be best, if we develope a application
      that is completely usable without having to connect to a
      device. This way, we could test the application without having
      to make a hardware prototype first. We started by building the
      whole application in Figma as a fully functional prototype. We
      then started building the application in Ionic React from
      scratch. At this time, we also already set up the Backend and
      the database. We used Prisma to generate the database models
      and used Planetscale for its hosting. We used Render.com to
      host the Backend. We have connected the application with Apple
      HealthKit and OpenWeather API to get the user's location and
      weather data for calculating the user's daily vitamin intake."
      processImage4="./images/boost/boost_device.webp"
      processHeading4="Hardware device"
      processText4="In our hardware, we incorporate a total of seven stepper
      motors, along with a selection of sensors, a circular display,
      and two ESP32 controllers. Our system is designed to
      efficiently transmit and receive data via HTTP requests,
      utilizing a range of libraries to ensure seamless control of
      all components. By opting for HTTP requests, we prioritize
      reliability in our product design and aim to offer a highly
      realistic user experience."
      videoThumbnail="./images/boost/boost_device.webp"
      videoSource="https://www.youtube.com/embed/DTpulxnIuxg?autoplay=1"
      projectLinks={[
        {
          text: "Landingpage",
          url: "https://boost-three.vercel.app/",
        },
        {
          text: "University Exhibition",
          url: "https://ausstellung.hfg-gmuend.de/w-2223/projekte/boost/studiengang:dp",
        },
      ]}
    />
  );
}
