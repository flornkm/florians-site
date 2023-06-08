import Link from "next/link";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import * as Icon from "react-feather";
import { NextSeo } from "next-seo";
import { ReactSketchCanvas } from 'react-sketch-canvas';

export default function Custom404() {
    const canvasRef = useRef(null);
    const [colorTheme, setColorTheme] = useState(null);

    useEffect(() => {
        setColorTheme(localStorage.getItem("color-theme"));
    }, []);

    return (
        <>
            <NextSeo
                title="404 - Florian"
                description="This is the 404 page of Florian's website."
                nofollow={true}
            />
            <div className="flex flex-col items-center justify-center h-screen"
            >
                <ReactSketchCanvas
                    style={{
                        border: "none",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                    width="100%"
                    height="100vh"
                    strokeColor={
                        colorTheme
                            ? colorTheme === "dark"
                                ? "#ffffff"
                                : "#000000"
                            : typeof window !== "undefined" &&
                                window.matchMedia("(prefers-color-scheme: dark)")
                                    .matches
                                ? "#ffffff"
                                : "#000000"
                    }
                    canvasColor="rgba(0,0,0,0)"
                    animate={true}
                    ref={canvasRef}
                    strokeWidth={2}
                />
                <div className="text-xl pointer-events-none font-display absolute bottom-8 left-16 right-16 dark:text-white">
                    Don't want to go home? Then draw and kill some time!
                </div>
                <div className="border border-zinc-100 dark:border-zinc-900 flex items-center justify-center flex-col p-8 rounded-3xl relative z-50 pointer-events-none bg-white dark:bg-zinc-900 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-xl">
                    <div className="pb-4 relative z-0 flex items-center justify-center">
                        <h1 className="text-[80px] font-medium text-black dark:text-white pointer-events-none">404</h1>
                    </div>
                    <Link
                        className="dflt-button pointer-events-auto dark:bg-[#09090b] dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:border-[#212126] dark:text-white flex items-center"
                        href="/"
                    >
                        <Icon.Home className="mr-3" strokeWidth={2.5} size={16} />
                        Return Home
                    </Link>
                </div>
            </div>
            <Footer />
        </>
    );
}
