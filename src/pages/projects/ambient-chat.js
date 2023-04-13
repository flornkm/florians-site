import Project from "@/components/Project";

export default function AmbientChat() {
  return (
    <Project
      projectTitle="Ambient Chat"
      shortDescription="Chat application with GPT-3 integration"
      bannerSource="./images/ambient_chat/banner-ambient_chat.jpg"
      projectMainDescription="Ambient Chat started out as a simple idea for a chat room with an attractive user interface. I built the frontend using VueJS and the backend with a NodeJS Express server using SocketIO for communication between the two. As I explored the latest technologies, I realized that I could expand the scope of the project beyond my initial vision. The result is a full-fledged chat application that enables users to send, receive, and store messages from other logged-in users. Additionally, I integrated OpenAI's GPT-3 technology to enable users to converse not just with other humans, but also with AI chatbots that feel realistic and natural."
      slideImages={[
        "./images/ambient_chat/ambient_chat_interface.webp",
        "./images/ambient_chat/ambient_chat_settings.webp",
        "./images/ambient_chat/ambient_chat_friendlist.webp",
        "./images/ambient_chat/ambient_chat_input.webp",
        "./images/ambient_chat/ambient_chat_box.webp",
      ]}
      processImage1="./images/ambient_chat/ambient_chat_blueprint.jpg"
      processHeading1="Organizing my codebase"
      processText1="Before diving into development, I spent time blueprinting my application in FigJam to plan out the structure of my classes and components. I found this to be a crucial step in creating a clean and organized codebase. By breaking down the application's functionality and visualizing the various components that would be necessary to achieve it, I was able to streamline the development process and ensure that everything would connect seamlessly."
      processImage2="./images/ambient_chat/ambient_chat_components.jpg"
      processHeading2="Building the core components"
      processText2="Once I had sketched out my ideas and determined the architecture of my application, I began building classes and components using VueJS, my chosen frontend framework. My first task was to create a core component that I knew would be essential later in the development process. Meanwhile, on the backend, I initialized a NodeJS server and installed the Express framework, which allowed me to start testing the sending and receiving of data. By taking a strategic approach to development, I was able to quickly establish the foundation of my application and start building out its core functionality."
      processImage3="./images/ambient_chat/ambient_chat_user_experience.jpg"
      processHeading3="Refining the user experience"
      processText3="After building the frontend and backend components, I moved on to styling the application using CSS. I found it important to ensure that the design was both aesthetically pleasing and user-friendly. I also focused on making the application responsive, so it would look great on all devices. Once the styling was complete, I dockerized the application to make it more scalable and efficient. This also made it easier to deploy and manage, which was a big plus for me. For the database, I decided to use Airtable API, which allowed for easy integration with my application. I found that Airtable provided a simple and intuitive way to manage and store data, which made it a great choice for my project."
      videoThumbnail="./images/ambient_chat/ambient_chat.jpg"
      videoSource="https://www.youtube.com/embed/FcL5ehtL1uU?autoplay=1&loop=1"
      projectLinks={[
        {
          text: "Chat (restricted mode)",
          url: "https://ambient-chat.onrender.com/",
        },
      ]}
    />
  );
}
