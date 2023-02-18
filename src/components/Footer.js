import Link from "next/link";
import AnalogClock from "analog-clock-react";

export default function Footer() {
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
    <div class="w-full min-h-[300px] bg-zinc-800 pt-24 pb-24">
      <div class="flex justify-between place-items-top max-w-6xl pl-[10%] pr-[10%] m-auto max-md:flex-col max-md:gap-24">
        <div class="w-[50%]">
          <AnalogClock {...options} />
        </div>
        <div class="flex flex-col gap-2 font-medium items-start">
          <h4 class="text-xl text-white mb-2">Navigation</h4>
          <Link
            href={"/"}
            class="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            Home
          </Link>
          <Link
            href={"/#projects"}
            class="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            Projects
          </Link>
          <Link
            href={"/concepts"}
            class="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            Concepts
          </Link>
          <Link
            href={"/about"}
            class="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            About
          </Link>
        </div>
        <div class="flex flex-col gap-2 font-medium items-start">
          <h4 class="text-xl text-white mb-2">Info</h4>
          <Link
            href={"#"}
            class="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            Journal
          </Link>
          <Link
            href={"/colophon"}
            class="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            Colophon
          </Link>
        </div>
      </div>
      <div class="h-16"></div>
      <div class="flex justify-between place-items-top max-w-6xl pl-[10%] pr-[10%] m-auto max-md:flex-col max-md:gap-8">
        <p class="text-zinc-500 text-xs">
          {new Date().getFullYear()} Design With Tech. All Rights Reserved.
        </p>
        <div class="flex gap-8 font-medium">
            <Link href={"/legal-notice"} class="text-zinc-400 text-xs p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2">Legal Notice</Link>
            <Link href={"/privacy-policy"} class="text-zinc-400 text-xs p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
