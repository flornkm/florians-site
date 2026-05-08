import { create } from "zustand";

type State = {
  reading: number;
  powered: boolean;
  dragging: boolean;
  bodyDocked: boolean;
  highlighted: Element | null;
  aiRating: number;
  setReading: (n: number) => void;
  setPowered: (v: boolean) => void;
  togglePower: () => void;
  setDragging: (v: boolean) => void;
  setBodyDocked: (v: boolean) => void;
  setHighlighted: (el: Element | null) => void;
  setAiRating: (r: number) => void;
};

export const useStore = create<State>((set, get) => ({
  reading: 0,
  powered: false,
  dragging: false,
  bodyDocked: false,
  highlighted: null,
  aiRating: 0,
  setReading: (reading) => set({ reading }),
  setPowered: (powered) => set({ powered }),
  togglePower: () => set({ powered: !get().powered }),
  setDragging: (dragging) => set({ dragging }),
  setBodyDocked: (bodyDocked) => set({ bodyDocked }),
  setHighlighted: (highlighted) => set({ highlighted }),
  setAiRating: (aiRating) => set({ aiRating }),
}));
