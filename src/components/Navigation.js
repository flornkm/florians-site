import Link from "next/link";
import * as Icon from "react-feather";

export default function Navigation(title, highlight) {
  return (
    <div class="w-full fixed md:border-b max-md:border max-md:rounded-full max-md:w-[80%] max-md:left-[50%] max-md:translate-x-[-50%] max-md:bottom-8 bg-white z-50 overflow-hidden">
      <div class="flex h-16 justify-between place-items-center max-w-7xl md:pl-[10%] md:pr-[10%] max-md:pl-4 max-md:pr-4 m-auto max-md:w-full">
        <Link
          href={"/"}
          class="flex justify-center max-md:place-items-center md:place-items-end md:gap-2 hover:opacity-60 transition-all max-sm:hidden"
        >
          <span class="text-xl text-black right-8 m-0 font-medium">
            Florian
          </span>
          <span class="text-gray-500 m-0 max-md:hidden">{title.title}</span>
        </Link>
        <div class="flex max-sm:w-full">
          <ul class="flex gap-4 place-items-center font-medium max-md:justify-between max-md:w-full">
            <li>
              <Link
                class={
                  title.highlight === "Home"
                    ? "bg-gray-100 p-2 text-black hover:text-black transition-all rounded-md flex max-md:p-2"
                    : "bg-none p-2 text-gray-600 hover:text-black transition-all rounded-lg flex max-md:p-2"
                }
                href="/"
              >
                <span class="md:block max-md:hidden">Home</span>
                <Icon.Home class="max-md:block md:hidden" size={24} />
              </Link>
            </li>
            <li>
              <Link
                class={
                  title.highlight === "Projects"
                    ? "bg-gray-100 p-2 text-black hover:text-black transition-all rounded-md flex max-md:p-2"
                    : "bg-none p-2 text-gray-600 hover:text-black transition-all rounded-lg flex max-md:p-2"
                }
                href="/#projects"
              >
                <span class="md:block max-md:hidden">Projects</span>
                <Icon.Folder class="max-md:block md:hidden" size={24} />
              </Link>
            </li>
            <li>
              <Link
                class={
                  title.highlight === "Concepts"
                    ? "bg-gray-100 p-2 text-black hover:text-black transition-all rounded-md flex max-md:p-2"
                    : "bg-none p-2 text-gray-600 hover:text-black transition-all rounded-lg flex max-md:p-2"
                }
                href="#"
              >
                <span class="md:block max-md:hidden">Concepts</span>
                <Icon.User class="max-md:block md:hidden" size={24} />
              </Link>
            </li>
            <li>
              <Link
                class={
                  title.highlight === "About"
                    ? "bg-gray-100 p-2 text-black hover:text-black transition-all rounded-md flex max-md:p-2"
                    : "bg-none p-2 text-gray-600 hover:text-black transition-all rounded-lg flex max-md:p-2"
                }
                href="/about"
              >
                <span class="md:block max-md:hidden">About</span>
                <Icon.User class="max-md:block md:hidden" size={24} />
              </Link>
            </li>
            <Link
              class="bg-[#1280EC] text-white sm:pr-4 sm:pl-4 sm:pt-2 sm:pb-2 max-sm:p-2 rounded-md hover:bg-[#2795FE] transition-all flex"
              href="/#contact"
            >
              <span class="md:block max-sm:hidden">Contact</span>
              <Icon.MessageCircle class="max-md:block sm:hidden" size={24} />
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
}
