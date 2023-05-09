import Link from "next/link";
import Footer from "@/components/Footer";

export default function Custom404() {
    return (
        <>
            <div className="flex flex-col items-center gap-4 justify-center h-[70vh]">
                <h1 className="text-[96px] font-mono font-bold text-transparent bg-gradient-to-t from-sky-700 to-black bg-clip-text dark:from-blue-300 dark:to-white">404</h1>
                <Link
                    className="bg-[#1280EC] text-white font-medium sm:pr-4 sm:pl-4 sm:pt-2 sm:pb-2 max-sm:p-2 rounded-md hover:bg-[#2795FE] transition-all flex"
                    href="/"
                >
                    Back to Home
                </Link>
            </div>
            <Footer />
        </>
    );
}
