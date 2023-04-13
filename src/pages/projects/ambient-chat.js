import Project from "@/components/Project";
import * as Icon from "react-feather";

export default function AmbientChat() {
  return (
    <Project
      projectTitle="Ambient Chat"
      shortDescription="Chat application with GPT-3 integration"
      bannerSource="./images/ambient_chat/banner-ambient_chat.jpg"
      projectMainDescription="Ambient Chat is a chat application that began as a simple idea for a sleek chat room interface. Using VueJS and NodeJS Express with SocketIO, I developed a complete chat platform that allows users to send, receive, and store messages from other users. In addition, I incorporated OpenAI's GPT-3 technology to enable users to chat with AI bots that feel authentic and natural.      "
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
      challenge="How can I create a chat application that is both aesthetically pleasing and user-friendly?
      And how can I integrate GPT-3 to create a chatbot that feels authentic and natural? (Chat-GPT didn't
      exist at the time)"
      result="Around 100 people have used the application on the experimental version. I also received
      positive feedback from people who tried it out, the most favourite feature being the chatbot."
      videoThumbnail="./images/ambient_chat/ambient_chat.jpg"
      videoSource="https://www.youtube.com/embed/FcL5ehtL1uU?autoplay=1&loop=1"
      projectLinks={[
        {
          text: "Chat (restricted mode)",
          url: "https://ambient-chat.onrender.com/",
        },
      ]}
      stack={[
        {
          name: "Prototyping",
          icon: <Icon.Figma size={18} />,
          color: "text-blue-500 dark:text-blue-400",
          ringColor: "ring-blue-200 dark:ring-blue-800 dark:ring-opacity-50",
          backgroundColor: "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20"
        },
        {
          name: "VueJS",
          icon: <Icon.Code size={18} />,
          color: "text-purple-500 dark:text-purple-400",
          ringColor: "ring-purple-200 dark:ring-purple-800 dark:ring-opacity-50",
          backgroundColor: "bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20"
        },
        {
          name: "NodeJS Express",
          icon: <Icon.Server size={18} />,
          color: "text-purple-500 dark:text-purple-400",
          ringColor: "ring-purple-200 dark:ring-purple-800 dark:ring-opacity-50",
          backgroundColor: "bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20"
        },
        {
          name: "SocketIO",
          icon: <Icon.Server size={18} />,
          color: "text-purple-500 dark:text-purple-400",
          ringColor: "ring-purple-200 dark:ring-purple-800 dark:ring-opacity-50",
          backgroundColor: "bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20"
        },
        {
          name: "Airtable",
          icon: <Icon.Database size={18} />,
          color: "text-orange-500 dark:text-orange-400",
          ringColor: "ring-orange-200 dark:ring-orange-800 dark:ring-opacity-50",
          backgroundColor: "bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20"
        },
      ]}
    />
  );
}
