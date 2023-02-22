import Link from "next/link";
import dynamic from 'next/dynamic'
import { Fragment, useEffect, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import * as Icon from "react-feather";

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

export default function Footer() {
  const menu = useRef();
  const [arrowUp, setArrowUp] = useState(false);
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

  const AnalogClock = dynamic(() => import("analog-clock-react"), {
    ssr: false,
  });

  useOutsideAlerter(menu, setArrowUp);
  return (
    <div className="w-full min-h-[300px] bg-zinc-800 pt-24 pb-24 dark:bg-black dark:bg-opacity-50">
      <div className="flex justify-between place-items-top max-w-6xl pl-[10%] pr-[10%] m-auto max-md:flex-col max-md:gap-24">
        <div className="w-[50%]">
          <AnalogClock {...options} />
          <div className="h-12"></div>
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button
                onClick={() => {
                  setArrowUp(!arrowUp);
                }}
                className="w-full flex place-items-center justify-center rounded-lg border bg-transparent border-zinc-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-all dark:bg-transparent dark:border-gray-800 dark:text-white dark:hover:bg-gray-900"
              >
                Toggle Mode
                <Icon.ChevronUp
                  className={
                    arrowUp
                      ? "ml-1 transition-all rotate-0"
                      : "ml-1 transition-all rotate-180"
                  }
                  size={20}
                />
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
              <Menu.Items
                ref={menu}
                className="absolute overflow-hidden left-0 top-[-124px] z-10 w-40 origin-bottom-left rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 p-1"
              >
                <div className="py-0">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white"
                            : "text-gray-700 border-l-transparent dark:text-gray-300",
                          "flex w-full px-4 py-2 text-left text-sm font-medium gap-2 place-items-center rounded-lg"
                        )}
                        onClick={() => {
                            document.documentElement.classList.remove("dark");
                            localStorage.setItem("color-theme", "light");
                            setArrowUp(false);
                        }}
                      >
                        <Icon.Sun size={16} />
                        Lightmode
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white"
                            : "text-gray-700 border-l-transparent dark:text-gray-300",
                          "flex w-full px-4 py-2 text-left text-sm font-medium gap-2 place-items-center rounded-lg"
                        )}
                        onClick={() => {
                            document.documentElement.classList.add("dark");
                            localStorage.setItem("color-theme", "dark");
                            setArrowUp(false);
                        }}
                      >
                        <Icon.Moon size={16} />
                        Darkmode
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="submit"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white"
                            : "text-gray-700 border-l-transparent dark:text-gray-300",
                          "flex w-full px-4 py-2 text-left text-sm font-medium gap-2 place-items-center rounded-lg"
                        )}
                        onClick={() => {
                          if (localStorage.getItem("color-theme")) {
                            localStorage.removeItem('color-theme');
                            window.location.reload();
                          }
                          setArrowUp(false);
                        }}
                      >
                        <Icon.Circle size={16} />
                        Auto
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
        <div className="flex flex-col gap-2 font-medium items-start">
          <h4 className="text-xl text-white mb-2">Navigation</h4>
          <Link
            href={"/"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2 dark:hover:bg-gray-800"
          >
            Home
          </Link>
          <Link
            href={"/#projects"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2 dark:hover:bg-gray-800"
          >
            Projects
          </Link>
          <Link
            href={"/concepts"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2 dark:hover:bg-gray-800"
          >
            Concepts
          </Link>
          <Link
            href={"/about"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2 dark:hover:bg-gray-800"
          >
            About
          </Link>
        </div>
        <div className="flex flex-col gap-2 font-medium items-start">
          <h4 className="text-xl text-white mb-2">Info</h4>
          <Link
            href={"/journal"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2 dark:hover:bg-gray-800"
          >
            Journal
          </Link>
          <Link
            href={"/colophon"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2 dark:hover:bg-gray-800"
          >
            Colophon
          </Link>
        </div>
      </div>
      <div className="h-16"></div>
      <div className="flex justify-between place-items-top max-w-6xl pl-[10%] pr-[10%] m-auto max-md:flex-col max-md:gap-8">
        <p className="text-zinc-500 text-xs">
          {new Date().getFullYear()} Design With Tech. All Rights Reserved.
        </p>
        <div className="flex gap-8 font-medium">
          <Link
            href={"/legal-notice"}
            className="text-zinc-400 text-xs p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2 dark:hover:bg-gray-800"
          >
            Legal Notice
          </Link>
          <Link
            href={"/privacy-policy"}
            className="text-zinc-400 text-xs p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2 dark:hover:bg-gray-800"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
