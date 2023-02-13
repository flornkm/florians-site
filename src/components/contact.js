import Link from "next/link";
import Image from "next/image";
import { Fragment, useState, useRef, useEffect } from "react";
import * as Icon from "react-feather";
import { Menu, Transition } from "@headlessui/react";
import Message from "./message";

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
      class="relative w-full h-[510px] bg-gray-50 rounded-xl overflow-hidden"
    >
      <div class="w-full h-16 flex justify-between place-items-center pl-4 pr-4 border-b border-b-solid bg-gray-50 bg-opacity-90 backdrop-blur-md z-10 relative">
        <div class="flex place-items-center gap-3">
          <Image
            loader={imgLoader}
            src="memoji.png"
            alt="Florian Profile Avatar"
            class="rounded-full bg-white border border-solid p-1"
            width={48}
            height={48}
          />
          <p class="text-xl font-medium">Florian</p>
        </div>
        <div class="flex gap-4">
          <Icon.Video class="text-gray-300" />
          <Icon.Info class="text-gray-300" />
        </div>
      </div>
      <div
        class="h-[360px] flex flex-col justify-end gap-4 relative mb-4"
        ref={chatWrapper}
      >
        {messages.map((message, index) => (
          <Message key={index} msg={message.msg} type={message.type} />
        ))}
      </div>
      <div class="w-full flex gap-3 pl-3 pr-3 h-[64px] place-items-center justify-between">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button onClick={() => {setArrowUp(!arrowUp)}} className="w-full h-[48px] flex place-items-center justify-center rounded-full border bg-white border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
              <Icon.Smartphone />
              <Icon.ChevronUp class={arrowUp ? "ml-1 transition-all rotate-0" : "ml-1 transition-all rotate-180"} size={20} />
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
            <Menu.Items ref={menu} className="absolute overflow-hidden left-0 top-[-150px] z-10 w-56 origin-bottom-left rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-0">
                <Link href="#">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900 border-l-[#1480EB]"
                            : "text-gray-700 border-l-transparent",
                          "block w-full px-4 py-2 text-left text-sm font-medium border-l-2"
                        )}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Link>
                <Link href="#">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900 border-l-[#1480EB]"
                            : "text-gray-700 border-l-transparent",
                          "block w-full px-4 py-2 text-left text-sm font-medium border-l-2"
                        )}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Link>
                <Link href="#">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900 border-l-[#1480EB]"
                            : "text-gray-700 border-l-transparent",
                          "block w-full px-4 py-2 text-left text-sm font-medium border-l-2"
                        )}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Link>
                <Link href="#">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900 border-l-[#1480EB]"
                            : "text-gray-700 border-l-transparent",
                          "block w-full px-4 py-2 text-left text-sm font-medium border-l-2"
                        )}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Link>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        <div class="w-full h-[48px] bg-white rounded-full border border-solid border-gray-300 relative text-sm">
          <input
            ref={input}
            class="absolute top-0 right-0 left-0 bottom-0 rounded-full p-3"
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
            class="right-2 text-white bg-[#1480EB] absolute rounded-full p-1 cursor-pointer top-[50%] translate-y-[-50%] hover:bg-[#2795FD] transition-all"
            size={28}
          />
        </div>
      </div>
    </div>
  );
}
