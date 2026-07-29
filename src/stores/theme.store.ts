import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

const initial: Theme =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: initial,
      toggle: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      set: (t) => set({ theme: t })
    }),
    { name: "rotacerta-theme" }
  )
);
