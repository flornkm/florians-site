import Link from "next/link";
import Image from "next/image";
import { Fragment, useState, useRef, useEffect } from "react";
import * as Icon from "react-feather";
import { Menu, Transition } from "@headlessui/react";
import Message from "./Message";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function useOutsideAlerter(ref, setArrowUp) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setArrowUp(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export default function Contact() {
  const chatWrapper = useRef();
  const input = useRef();
  const menu = useRef();
  const [arrowUp, setArrowUp] = useState(false);
  const imgLoader = ({ src, width, quality }) => {
    return `/${src}?w=${width}&q=${quality || 75}`;
  };
  const [messages, setMessages] = useState([
    { msg: "Hey, what is your name? 👋", type: "left" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  useOutsideAlerter(menu, setArrowUp);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setArrowUp(false);
    }
  };

  const sendMessage = () => {
    if (input.current.value !== "") {
      if (messages.length === 1) {
        setMessages([...messages, { msg: newMessage, type: "right" }]);
        setNewMessage("");

        setTimeout(() => {
          setMessages((messages) => [
            ...messages,
            { msg: `Nice to meet you, ${messages[1].msg}.`, type: "left" },
          ]);
        }, 1000);

        setTimeout(() => {
          setMessages((messages) => [
            ...messages,
            { msg: "So tell me, why are you contacting me?", type: "left" },
          ]);
        }, 2000);
      } else if (messages.length === 4) {
        setMessages([...messages, { msg: newMessage, type: "right" }]);
        setNewMessage("");

        setTimeout(() => {
          setMessages((messages) => [
            ...messages,
            { msg: "Got it. Thanks for the information.", type: "left" },
          ]);
        }, 1000);

        setTimeout(() => {
          setMessages((messages) => [
            ...messages,
            {
              msg: "I just need a way to contact you. Might you give me your e-mail?",
              type: "left",
            },
          ]);
        }, 2000);
      } else if (messages.length === 7 && newMessage.includes("@")) {
        setMessages([...messages, { msg: newMessage, type: "right" }]);
        const data = {
          name: messages[1].msg,
          email: newMessage,
          message: messages[4].msg
        };
        setNewMessage("");

        setTimeout(() => {
          setMessages((messages) => [
            ...messages,
            { msg: "Writing it down real quick… ✍️", type: "left" },
          ]);
        }, 1000);

        fetch("https://formspree.io/f/xbjwjdre", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            setTimeout(() => {
              setMessages((messages) => [
                ...messages,
                { msg: "Done! I reach out to you soon.", type: "left" },
              ]);
            }, 3500);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  };

  return (
    <div
      id="contact"
      className="relative w-full min-h-[510px] bg-zinc-100 rounded-xl overflow-hidden dark:bg-zinc-900 dark:bg-opacity-50"
    >
      <div className="w-full h-16 flex justify-between place-items-center pl-4 pr-4 border-b border-b-solid bg-zinc-50 bg-opacity-90 backdrop-blur-md z-10 relative dark:bg-zinc-800 dark:border-zinc-700">
        <div className="flex place-items-center gap-3">
          <Image
            loader={imgLoader}
            src="./images/memoji.png"
            alt="Florian Profile Avatar"
            className="rounded-full bg-white border border-solid p-1"
            width={48}
            height={48}
          />
          <p className="text-xl font-medium">Florian</p>
        </div>
        <div className="flex gap-4">
          <Icon.Video className="text-zinc-300 dark:text-zinc-600" />
          <Icon.Info className="text-zinc-300 dark:text-zinc-600" />
        </div>
      </div>
      <div
        className="h-[360px] flex flex-col justify-end gap-4 relative mb-4"
        ref={chatWrapper}
      >
        {messages.map((message, index) => (
          <Message key={index} msg={message.msg} type={message.type} />
        ))}
      </div>
      <div className="w-full flex gap-2 pl-3 pr-3 min-h-[64px] place-items-center justify-between max-sm:pb-3 max-sm:flex-wrap">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button onClick={() => {setArrowUp(!arrowUp)}} className="w-full h-[48px] flex place-items-center justify-center rounded-full border bg-white border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-all dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800">
              <Icon.Smartphone />
              <Icon.ChevronUp className={arrowUp ? "ml-1 transition-all rotate-0" : "ml-1 transition-all rotate-180"} size={20} />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-100"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items ref={menu} className="absolute overflow-hidden left-0 top-[-128px] z-10 origin-bottom-left rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 outline-none focus:outline-none dark:bg-zinc-800 dark:ring-zinc-700 p-1">
              <div className="py-0">
                <Link href="https://twitter.com/floriandwt" target={"_blank"}>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active
                            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-white"
                            : "text-zinc-700 border-l-transparent dark:text-zinc-300",
                            "flex w-full px-4 py-2 text-left text-sm font-medium gap-2 place-items-center rounded-lg"
                        )}
                      >
                        <Icon.Twitter size={16} />
                        @floriandwt
                      </button>
                    )}
                  </Menu.Item>
                </Link>
                <Link href="https://github.com/floriandwt" target={"_blank"}>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active
                            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-white"
                            : "text-zinc-700 border-l-transparent dark:text-zinc-300",
                            "flex w-full px-4 py-2 text-left text-sm font-medium gap-2 place-items-center rounded-lg"
                        )}
                      >
                        <Icon.GitHub size={16} />
                        @floriandwt
                      </button>
                    )}
                  </Menu.Item>
                </Link>
                <Link href="https://www.linkedin.com/in/floriandwt/" target={"_blank"}>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active
                            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-white"
                            : "text-zinc-700 border-l-transparent dark:text-zinc-300",
                            "flex w-full px-4 py-2 text-left text-sm font-medium gap-2 place-items-center rounded-lg"
                        )}
                      >
                        <Icon.Linkedin size={16} />
                        /floriandwt
                      </button>
                    )}
                  </Menu.Item>
                </Link>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        {/* <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            Options
            
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-bottom-right top-[-72px] divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-violet-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Edit
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-violet-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Duplicate
                  </button>
                )}
              </Menu.Item>
            </div>
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-violet-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Archive
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-violet-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Move
                  </button>
                )}
              </Menu.Item>
            </div>
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-violet-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Delete
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu> */}
        <div className="w-full h-[48px] bg-white rounded-full border border-solid border-zinc-300 relative text-sm dark:border-zinc-700">
          <input
            ref={input}
            className="absolute top-0 right-0 left-0 bottom-0 rounded-full p-3 dark:text-white dark:bg-zinc-900"
            placeholder="Enter your message"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          ></input>
          <Icon.ArrowUp
            onClick={sendMessage}
            className="right-2 text-white bg-[#1480EB] absolute rounded-full p-1 cursor-pointer top-[50%] translate-y-[-50%] hover:bg-[#2795FD] transition-all"
            size={28}
          />
        </div>
      </div>
    </div>
  );
}
