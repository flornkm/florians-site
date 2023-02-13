import Link from "next/link";

export default function Navigation(title) {
  return (
    <div class="w-full fixed md:border-b max-md:border max-md:rounded-full max-md:w-[90%] max-md:mr-auto max-md:ml-auto max-md:bottom-8 bg-white z-50">
      <div class="flex h-16 justify-between place-items-center max-w-7xl pl-[10%] pr-[10%] m-auto">
        <Link
          href={"#"}
          class="flex justify-center max-md:place-items-center md:place-items-end gap-2 hover:opacity-60 transition-all"
        >
          <span class="text-xl text-black right-8 m-0 font-medium">Florian</span>
          <span class="text-gray-500 m-0 max-md:invisible">{title.title}</span>
        </Link>
        <div class="flex">
          <ul class="flex gap-4 place-items-center font-medium">
            <li class="p-2 text-gray-600 hover:text-black transition-all">
              <Link href="#">Home</Link>
            </li>
            <li class="p-2 text-gray-600 hover:text-black transition-all">
              <Link href="#">Projects</Link>
            </li>
            <li class="p-2 text-gray-600 hover:text-black transition-all">
              <Link href="#">About</Link>
            </li>
            <button class="bg-[#1280EC] text-white pr-4 pl-4 pt-2 pb-2 rounded-md hover:bg-[#2795FE] transition-all" href="#">
              Contact
            </button>
          </ul>
        </div>
      </div>
    </div>
  );
}
