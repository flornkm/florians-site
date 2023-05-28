import Link from "next/link";
import { useEffect, useState } from "react";
import * as Icon from "react-feather";

export default function Navigation(title, highlight) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.addEventListener("scroll", () => {
        if (window.scrollY > 0) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }
      });
    }
  }, []);

  return (
    <div className={"w-full fixed max-md:border max-md:rounded-full max-md:w-[80%] max-md:left-[50%] max-md:translate-x-[-50%] max-md:bottom-8 border-zinc-200 bg-white z-50 overflow-hidden md:border-b dark:bg-zinc-900 dark:border-zinc-800 transition-all duration-100 " + (scrolled ? "border-opacity-100 dark:md:bg-opacity-100" : "max-md:border-opacity-100 md:border-opacity-0 dark:md:border-opacity-0 dark:md:bg-opacity-0")}>
      <div className="flex h-16 justify-between place-items-center max-w-6xl md:pl-[5%] md:pr-[5%] max-md:pl-4 max-md:pr-4 m-auto max-md:w-full">
        <Link
          href={"/"}
          className="flex justify-center max-md:place-items-center md:place-items-end md:gap-2 hover:opacity-60 transition-all max-sm:hidden rounded-md"
        >
          <span className="text-xl text-black right-8 m-0 font-medium dark:text-white">
            Florian
          </span>
          <span className="text-zinc-500 m-0 max-md:hidden dark:text-zinc-400">{title.title}</span>
        </Link>
        <div className="flex max-sm:w-full">
          <ul className="flex gap-2 place-items-center font-medium max-md:justify-between max-md:w-full">
            <li>
              <Link
                className={
                  title.highlight === "Home"
                    ? "bg-zinc-100 p-2 text-black hover:text-black transition-all rounded-md flex max-md:p-2 max-md:bg-zinc-600 max-md:text-white max-md:hover:text-white dark:text-white dark:hover:text-white dark:bg-zinc-700"
                    : "bg-none p-2 text-zinc-600 hover:text-black transition-all rounded-lg flex max-md:p-2 dark:text-zinc-400 dark:hover:text-white"
                }
                href="/"
              >
                <span className="md:block max-md:hidden">Home</span>
                <Icon.Home className="max-md:block md:hidden" size={24} />
              </Link>
            </li>
            <li>
              <Link
                className={
                  title.highlight === "Work"
                    ? "bg-zinc-100 p-2 text-black hover:text-black transition-all rounded-md flex max-md:p-2 max-md:bg-zinc-600 max-md:text-white max-md:hover:text-white dark:text-white dark:hover:text-white dark:bg-zinc-700"
                    : "bg-none p-2 text-zinc-600 hover:text-black transition-all rounded-lg flex max-md:p-2 dark:text-zinc-400 dark:hover:text-white"
                }
                href="/#work"
              >
                <span className="md:block max-md:hidden">Work</span>
                <Icon.Folder className="max-md:block md:hidden" size={24} />
              </Link>
            </li>
            <li>
              <Link
                className={
                  title.highlight === "Creations"
                    ? "bg-zinc-100 p-2 text-black hover:text-black transition-all rounded-md flex max-md:p-2 max-md:bg-zinc-600 max-md:text-white max-md:hover:text-white dark:text-white dark:hover:text-white dark:bg-zinc-700"
                    : "bg-none p-2 text-zinc-600 hover:text-black transition-all rounded-lg flex max-md:p-2 dark:text-zinc-400 dark:hover:text-white"
                }
                href="/creations"
              >
                <span className="md:block max-md:hidden">Creations</span>
                <Icon.Zap className="max-md:block md:hidden" size={24} />
              </Link>
            </li>
            <li className="md:mr-2">
              <Link
                className={
                  title.highlight === "About"
                    ? "bg-zinc-100 p-2 text-black hover:text-black transition-all rounded-md flex max-md:p-2 max-md:bg-zinc-600 max-md:text-white max-md:hover:text-white dark:text-white dark:hover:text-white dark:bg-zinc-700"
                    : "bg-none p-2 text-zinc-600 hover:text-black transition-all rounded-lg flex max-md:p-2 dark:text-zinc-400 dark:hover:text-white"
                }
                href="/about"
              >
                <span className="md:block max-md:hidden">About</span>
                <Icon.User className="max-md:block md:hidden" size={24} />
              </Link>
            </li>
            <Link
              className="bg-[#1280EC] text-white sm:pr-4 sm:pl-4 sm:pt-2 sm:pb-2 max-sm:p-2 rounded-md hover:bg-[#2795FE] transition-all flex font-medium"
              href="/#contact"
            >
              <span className="md:block max-sm:hidden">Contact</span>
              <Icon.MessageCircle className="max-md:block sm:hidden" size={24} />
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
}
