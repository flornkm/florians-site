// https://vike.dev/Head

// import logoUrl from "../assets/logo.svg";

export default function HeadDefault() {
  return (
    <>
      {import.meta.env.DEV && <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />}
      {/* <link rel="icon" href={logoUrl} /> */}
    </>
  );
}
