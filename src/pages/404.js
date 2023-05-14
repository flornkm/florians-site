import Link from "next/link";
import Footer from "@/components/Footer";
import RiveComponent from "@rive-app/react-canvas";

export default function Custom404() {
    return (
        <>
            <div className="flex flex-col items-center gap-2 justify-center h-screen">
            <div className="w-full md:pt-20 pb-4 max-md:h-[400px] relative z-0">
                <RiveComponent
                    artboard="404"
                    src="./animations/404.riv"
                    className="w-full h-[400px] object-contain m-auto"
                />
            </div>
                <Link
                    className="bg-[#1280EC] text-white font-medium sm:pr-4 sm:pl-4 sm:pt-2 sm:pb-2 max-sm:p-2 rounded-md hover:bg-[#2795FE] transition-all flex"
                    href="/"
                >
                    Return Home
                </Link>
            </div>
            <Footer />
        </>
    );
}
