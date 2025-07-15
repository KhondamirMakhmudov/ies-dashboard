// store/globalStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";

let store = (set) => ({
  selectedCamera: null,
  setSelectedCamera: (camera) => set({ selectedCamera: camera }),
});

store = devtools(store);

export const useGlobalStore = create(store);
