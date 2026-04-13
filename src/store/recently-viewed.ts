import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string;
}

interface RecentlyViewedStore {
  items: RecentItem[];
  add: (item: RecentItem) => void;
  clear: () => void;
}

const MAX_ITEMS = 6;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== item.id);
          return { items: [item, ...filtered].slice(0, MAX_ITEMS) };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "rp-recently-viewed" }
  )
);
