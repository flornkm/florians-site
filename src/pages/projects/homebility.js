import Project from "@/components/Project";

export default function Homebility() {
  return (
    <Project
      projectTitle="Homebility"
      shortDescription="Smart home application with a big focus on UX"
      bannerSource="./images/homebility/banner-homebility.jpg"
      collaborators={["Alice"]}
      projectMainDescription="Alice and I recognized that many smart home applications were difficult to use and had complex interfaces. We wanted to create a solution that made smart home technology more accessible and easy to understand for everyone. That's how we came up with Homebility, a user-friendly platform that connects with various smart home devices. Our goal was to help people control their smart homes in a more intuitive and efficient way."
      slideImages={[
        "./images/homebility/homebility_sketches.webp",
        "./images/homebility/homebility_application_in_hand.webp",
        "./images/homebility/homebility_figjam.webp",
        "./images/homebility/homebility_connected.webp",
        "./images/homebility/homebility_mockup.webp",
      ]}
      processImage1="./images/homebility/homebility_research.jpg"
      processHeading1="User research and ideation"
      processText1="During the initial weeks of the project, my partner Alice and I employed various user research methods to gain insight into our customers' needs. We utilized a diverse range of techniques to gather data, which we then used to develop a user persona that reflected our target audience."
      processImage2="./images/homebility/homebility_sketches.jpg"
      processHeading2="Lowfidelity sketches"
      processText2="After finishing the user research, we moved on to the next phase of the project. We started with creative thinking processes and created a user flow to better visualize our ideas. To generate even more ideas, we used the crazy 8's method. Finally, we created the first screens using a Mockup app to have a better understanding of what the final product would look like."
      processImage3="./images/homebility/homeblity_user_testing.jpg"
      processHeading3="User testing and iterations"
      processText3="After creating the first screens, we continued with iterating through low fidelity versions until we felt comfortable moving onto mid fidelity screens. We used Figma to create the mid fidelity screens and started conducting user tests to gather feedback. Based on the results of the user tests, we made necessary changes and continued iterating until we had a user-friendly and efficient interface."
      processImage4="./images/homebility/homebility_design.jpg"
      processHeading4="Polished design and prototype"
      processText4="During the final stage of the project, we created a completely clickable prototype in Figma. This allowed us to test the app with real users and get feedback on the overall functionality and user experience. We also worked on branding the app, choosing colors and typography that reflected the values of our app and the ideas behind and would resonate with our target audience. By the end of this phase, we had a fully designed app."
      projectLinks={[
        {
          text: "Figma Prototype",
          url: "https://www.figma.com/proto/nNVxSEvwhOYCrpbsEkcdy2/visual_prototyping_project?page-id=304%3A10971&node-id=399%3A18472&viewport=712%2C458%2C0.07&scaling=scale-down&starting-point-node-id=399%3A18472",
        },
      ]}
    />
  );
}
