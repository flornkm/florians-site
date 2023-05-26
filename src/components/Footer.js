import Link from "next/link";
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from "react";
import * as Icon from "react-feather";

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
  const [colorTheme, setColorTheme] = useState(null);

  useEffect(() => {
    setColorTheme(localStorage.getItem("color-theme"));
  }, []);

  const AnalogClock = dynamic(() => import("analog-clock-react"), {
    ssr: false,
  });

  let options = {
    width: "112px",
    border: false,
    borderColor: "transparent",
    baseColor: "transparent",
    centerColor: "transparent",
    centerBorderColor: "transparent",
    handColors: {
      second: "#ef4444",
      minute: colorTheme === "dark" ? "#ffffff" : "#000000",
      hour: colorTheme === "dark" ? "#ffffff" : "#000000",
    },
  };
 

  useOutsideAlerter(menu, setArrowUp);
  return (
    <div className="w-full min-h-[300px] bg-white border-t border-zinc-100 dark:border-zinc-800 pt-24 pb-24 dark:bg-[#101012] dark:bg-opacity-50">
      <div className="flex justify-between place-items-top max-w-6xl pl-[10%] pr-[10%] m-auto max-md:flex-col max-md:gap-24">
        <div className="w-[50%] max-md:w-full">
          <div className="max-md:w-full max-md:flex max-md:justify-center md:justify-between">
            <AnalogClock {...options} />
          </div>
          <div className="h-8 max-md:h-2"></div>
          <div className="w-full flex justify-start">
            <div className="flex items-center gap-2 max-md:gap-4 pt-2 max-md:w-full max-md:justify-center max-md:pt-16 max-md:mx-8">
              <button
                onClick={() => {
                  document.documentElement.classList.remove("dark");
                  localStorage.setItem("color-theme", "light");
                  setColorTheme("light");
                  setArrowUp(false);
                }}
                className={"w-8 h-8 transition-all flex items-center justify-center rounded-md " + (colorTheme === "light" ? "dark:bg-white dark:text-black bg-black text-white" : "dark:text-white dark:hover:text-zinc-300 text-black hover:text-zinc-600")}
              >
                <Icon.Sun size={22} />
              </button>
              <button
                onClick={() => {
                  document.documentElement.classList.add("dark");
                  localStorage.setItem("color-theme", "dark");
                  setColorTheme("dark");
                  setArrowUp(false);
                }}
                className={"w-8 h-8 transition-all flex items-center justify-center rounded-md " + (colorTheme === "dark" ? "dark:bg-white dark:text-black bg-black text-white" : "dark:text-white dark:hover:text-zinc-300 text-black hover:text-zinc-600")}
              >
                <Icon.Moon size={22} />
              </button>
              <button
                onClick={() => {
                  if (localStorage.getItem("color-theme")) {
                    localStorage.removeItem('color-theme');
                    window.location.reload();
                  }
                  setArrowUp(false);
                }}
                className={"w-8 h-8 transition-all flex items-center justify-center rounded-md " + (!colorTheme ? "dark:bg-white dark:text-black bg-black text-white" : "dark:text-white dark:hover:text-zinc-300 text-black hover:text-zinc-600")}

              >
                <Icon.Circle size={22} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-start max-md:ml-8 font-medium">
          <h4 className="text-black mb-2 font-semibold dark:text-white">Navigation</h4>
          <Link
            href={"/"}
            className="dark:text-zinc-400 px-1.5 py-1 transition-all rounded-lg hover:text-zinc-600 dark:hover:text-zinc-200 text-zinc-500 hover:bg-zinc-100 -ml-1.5 dark:hover:bg-zinc-800"
          >
            Home
          </Link>
          <Link
            href={"/#work"}
            className="dark:text-zinc-400 px-1.5 py-1 transition-all rounded-lg hover:text-zinc-600 dark:hover:text-zinc-200 text-zinc-500 hover:bg-zinc-100 -ml-1.5 dark:hover:bg-zinc-800"
          >
            Work
          </Link>
          <Link
            href={"/creations"}
            className="dark:text-zinc-400 px-1.5 py-1 transition-all rounded-lg hover:text-zinc-600 dark:hover:text-zinc-200 text-zinc-500 hover:bg-zinc-100 -ml-1.5 dark:hover:bg-zinc-800"
          >
            Creations
          </Link>
          <Link
            href={"/about"}
            className="dark:text-zinc-400 px-1.5 py-1 transition-all rounded-lg hover:text-zinc-600 dark:hover:text-zinc-200 text-zinc-500 hover:bg-zinc-100 -ml-1.5 dark:hover:bg-zinc-800"
          >
            About
          </Link>
        </div>
        <div className="flex flex-col gap-2 items-start max-md:ml-8 font-medium">
          <h4 className="text-black mb-2 font-semibold dark:text-white">Info</h4>
          <Link
            href={"/entries"}
            className="dark:text-zinc-400 px-1.5 py-1 transition-all rounded-lg hover:text-zinc-600 dark:hover:text-zinc-200 text-zinc-500 hover:bg-zinc-100 -ml-1.5 dark:hover:bg-zinc-800"
          >
            Entries
          </Link>
          <Link
            href={"/colophon"}
            className="dark:text-zinc-400 px-1.5 py-1 transition-all rounded-lg hover:text-zinc-600 dark:hover:text-zinc-200 text-zinc-500 hover:bg-zinc-100 -ml-1.5 dark:hover:bg-zinc-800"
          >
            Colophon
          </Link>
        </div>
      </div>
      <div className="h-32"></div>
      <div className="flex justify-between items-center place-items-top max-w-6xl pl-[10%] pr-[10%] m-auto max-md:flex-col max-md:gap-8">
        <p className="text-zinc-500 text-xs">
          {new Date().getFullYear()} Design With Tech. All Rights Reserved.
        </p>
        <div className="flex gap-8 font-medium">
          <Link
            href={"/legal-notice"}
            className="text-zinc-400 px-1.5 py-1 transition-all rounded-md hover:text-zinc-600 -ml-2 dark:hover:text-white text-xs"
          >
            Legal Notice
          </Link>
          <Link
            href={"/privacy-policy"}
            className="text-zinc-400 px-1.5 py-1 transition-all rounded-md hover:text-zinc-600 -ml-2 dark:hover:text-white text-xs"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
