import { createContext } from "react";

export interface ThemeApi {
  theme: import("./themeStorage").ThemeState;
  notice: string | null;
  setPreset: (id: string) => void;
  setCustomAccent: (hex: string | null) => void;
  uploadFont: (file: File) => Promise<void>;
  clearFont: () => void;
  resetAll: () => void;
}

export const ThemeContext = createContext<ThemeApi | null>(null);
