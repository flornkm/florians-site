import { createContext, useContext } from "react";

export const ContainerContext = createContext<HTMLElement | null>(null);

export function useContainer() {
  return useContext(ContainerContext);
}
