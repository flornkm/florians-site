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
    <div className="w-full min-h-[300px] bg-zinc-800 pt-24 pb-24">
      <div className="flex justify-between place-items-top max-w-6xl pl-[10%] pr-[10%] m-auto max-md:flex-col max-md:gap-24">
        <div className="w-[50%]">
          <AnalogClock {...options} />
        </div>
        <div className="flex flex-col gap-2 font-medium items-start">
          <h4 className="text-xl text-white mb-2">Navigation</h4>
          <Link
            href={"/"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            Home
          </Link>
          <Link
            href={"/#projects"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            Projects
          </Link>
          <Link
            href={"/concepts"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            Concepts
          </Link>
          <Link
            href={"/about"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            About
          </Link>
        </div>
        <div className="flex flex-col gap-2 font-medium items-start">
          <h4 className="text-xl text-white mb-2">Info</h4>
          <Link
            href={"#"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
          >
            Journal
          </Link>
          <Link
            href={"/colophon"}
            className="text-gray-200 p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2"
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
            <Link href={"/legal-notice"} className="text-zinc-400 text-xs p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2">Legal Notice</Link>
            <Link href={"/privacy-policy"} className="text-zinc-400 text-xs p-2 transition-all rounded-lg hover:bg-zinc-700 -ml-2">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
