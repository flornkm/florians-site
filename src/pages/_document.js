import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="dark:bg-black selection:bg-blue-200 dark:selection:bg-[#172554]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
