// https://vike.dev/Head

import darkFavicon from "@public/images/icons/favicon-dark.ico";
import lightFavicon from "@public/images/icons/favicon.ico";

export default function HeadDefault() {
  return (
    <>
      {import.meta.env.DEV && <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />}
      <link rel="icon" href={lightFavicon} media="(prefers-color-scheme: light)" />
      <link rel="icon" href={darkFavicon} media="(prefers-color-scheme: dark)" />
    </>
  );
}
