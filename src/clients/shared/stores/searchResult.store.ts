import { Match } from "@/server/db/schema/matches.schema";
import { PublicApplicant } from "@/server/domains/applicants/applicants.type";
import { SearchResultCard } from "@/server/domains/histories/history.type";
import { create } from "zustand";

interface SearchResultStore {
  searchResultList: SearchResultCard[];
  selectedApplicant: PublicApplicant | null;
  selectedApplicantMatchInfo: Match | null;

  setSelectedApplicant: (applicant: PublicApplicant | null) => void;
  setSelectedApplicantMatchInfo: (matchInfo: Match | null) => void;
  setSearchResultList: (searchResultList: SearchResultCard[]) => void;
}

export const useSearchResultStore = create<SearchResultStore>((set) => ({
  selectedApplicant: null,
  selectedApplicantMatchInfo: null,
  searchResultList: [],

  setSelectedApplicantMatchInfo: (match: Match | null) =>
    set({ selectedApplicantMatchInfo: match }),
  setSelectedApplicant: (applicant) =>
    set((state) => {
      // selectedApplicant 변경 시, searchResultList에서 해당 match 정보도 자동 동기화
      const matchInfo = applicant
        ? state.searchResultList.find(
            (item) => item.applicant.id === applicant.id
          )?.match ?? null
        : null;

      return {
        selectedApplicant: applicant,
        selectedApplicantMatchInfo: matchInfo,
      };
    }),
  setSearchResultList: (searchResultList) =>
    set((state) => {
      // searchResultList 업데이트 시, 현재 선택된 applicant의 match도 자동 동기화
      const updatedMatch = state.selectedApplicant
        ? searchResultList.find(
            (item) => item.applicant.id === state.selectedApplicant?.id
          )?.match ?? null
        : state.selectedApplicantMatchInfo;

      return {
        searchResultList,
        selectedApplicantMatchInfo: updatedMatch,
      };
    }),
}));
