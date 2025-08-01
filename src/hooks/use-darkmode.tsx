import { useEffect, useState } from "react";

export const useDarkmode = () => {
  const [darkmode, setDarkmode] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setDarkmode(e.matches);
    };

    setDarkmode(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return { darkmode };
};
