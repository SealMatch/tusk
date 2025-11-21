import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SearchHistoryItem {
  id: string;
  query: string;
  createdAt: string;
}

interface SearchState {
  history: SearchHistoryItem[];
  addHistory: (query: string) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (query: string) =>
        set((state) => ({
          history: [
            {
              id: crypto.randomUUID(),
              query,
              createdAt: new Date().toISOString(),
            },
            ...state.history,
          ].slice(0, 50), // 최대 50개 유지
        })),
      removeHistory: (id: string) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "search-history",
    }
  )
);
