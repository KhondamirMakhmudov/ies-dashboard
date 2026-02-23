import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { config } from "@/config";

let store = (set) => ({
  user: null,
  serUser: (user) => set((state) => ({ ...state, user })),

  selectedCamera: null,
  setSelectedCamera: (camera) => set({ selectedCamera: camera }),

  currencyList: [],
  setCurrencyList: (currencyList) =>
    set((state) => ({ ...state, currencyList })),
});

let settingsStore = (set) => ({
  token: null,
  darkMode: false,
  highContrast: false,
  fontScale: 1,
  fontFamily: '"Nunito Sans", sans-serif',
  lang: config.DEFAULT_APP_LANG,
  setToken: (token) => set((state) => ({ ...state, token })),
  setLang: (lang) => set((state) => ({ ...state, lang })),
  setMode: (value) =>
    set((state) => ({
      ...state,
      darkMode: typeof value === "boolean" ? value : !state.darkMode,
    })),
  setHighContrast: (value) =>
    set((state) => ({
      ...state,
      highContrast:
        typeof value === "boolean" ? value : !state.highContrast,
    })),
  setFontScale: (fontScale) => set((state) => ({ ...state, fontScale })),
  setFontFamily: (fontFamily) => set((state) => ({ ...state, fontFamily })),
});

export const useLangStore = create((set) => ({
  lang: "en", // Default language
  setLang: (lang) => set({ lang }),
}));

store = devtools(store);
settingsStore = devtools(settingsStore);
settingsStore = persist(settingsStore, { name: "settings" });

export const useSettingsStore = create(settingsStore);
