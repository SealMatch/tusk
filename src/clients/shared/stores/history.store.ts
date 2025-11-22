import { SearchResultItem } from "@/server/domains/histories/history.type";
import { create } from "zustand";

interface SelectedHistoryState {
  historyId: string;
  query: string;
  results: SearchResultItem[];

  setHistoryId: (historyId: string) => void;
  setQuery: (query: string) => void;
  setResults: (results: SearchResultItem[]) => void;
}

export const useHistoryStore = create<SelectedHistoryState>()((set) => ({
  historyId: "",
  query: "",
  results: [],

  setHistoryId: (historyId) => set({ historyId }),
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
}));
