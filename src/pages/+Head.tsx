// https://vike.dev/Head

import darkFavicon from "@public/images/icons/favicon-dark.ico";
import lightFavicon from "@public/images/icons/favicon.ico";

// https://vike.dev/Head (+Head setting)
// Must export a named `Head`, not a default export
export function Head() {
  return (
    <>
      {import.meta.env.DEV && <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />}
      <link rel="icon" href={lightFavicon} media="(prefers-color-scheme: light)" />
      <link rel="icon" href={darkFavicon} media="(prefers-color-scheme: dark)" />
    </>
  );
}
