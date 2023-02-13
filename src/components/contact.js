import Link from "next/link";
import Image from "next/image";
import { Fragment, useState } from "react";
import * as Icon from "react-feather";
import { Menu, Transition } from "@headlessui/react";
import Message from "./message";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Contact() {
  const imgLoader = ({ src, width, quality }) => {
    return `/${src}?w=${width}&q=${quality || 75}`;
  };
  const [msgCount, setMsgCount] = useState(0);

  let options = {
    width: "100px",
    border: false,
    borderColor: "transparent",
    baseColor: "#000",
    centerColor: "transparent",
    centerBorderColor: "transparent",
    handColors: {
      second: "#ef4444",
      minute: "#ffffff",
      hour: "#ffffff",
    },
  };
  return (
    <div
      id="contact"
      class="relative w-full h-[510px] bg-gray-50 rounded-xl overflow-hidden"
    >
      <div class="w-full h-16 flex justify-between place-items-center pl-4 pr-4 border-b border-b-solid">
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
      <div class="h-[360px] flex flex-col place-items-end relative mb-4">
        <Message msg="Hey, what is your name? 👋" type="left" />
      </div>
      <div class="w-full flex gap-3 pl-3 pr-3 h-[64px] place-items-center justify-between">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="w-full h-[48px] flex place-items-center justify-center rounded-full border bg-white border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
              <Icon.Smartphone />
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
            <Menu.Items className="absolute overflow-hidden left-0 top-[-150px] z-10 w-56 origin-bottom-left rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
        <div class="w-[90%] h-[48px] bg-white rounded-full border border-solid border-gray-300 relative text-sm">
          <input
            class="absolute top-0 right-0 left-0 bottom-0 rounded-full p-3"
            placeholder="Enter your message"
          ></input>
          <Icon.ArrowUp
            class="right-2 text-white bg-[#1480EB] absolute rounded-full p-1 cursor-pointer top-[50%] translate-y-[-50%] hover:bg-[#2795FD] transition-all"
            size={28}
          />
        </div>
      </div>
    </div>
  );
}
