import { Match } from "@/server/db/schema/matches.schema";
import { PublicApplicant } from "@/server/domains/applicants/applicants.type";
import { create } from "zustand";

interface SelectedApplicantStore {
  selectedApplicant: PublicApplicant | null;
  selectedApplicantMatchInfo: Match | null;

  setSelectedApplicant: (applicant: PublicApplicant | null) => void;
  setSelectedApplicantMatchInfo: (matchInfo: Match | null) => void;
}

export const useSelectedApplicantStore = create<SelectedApplicantStore>(
  (set) => ({
    selectedApplicant: null,
    selectedApplicantMatchInfo: null,
    setSelectedApplicantMatchInfo: (match: Match | null) =>
      set({ selectedApplicantMatchInfo: match }),
    setSelectedApplicant: (applicant) => set({ selectedApplicant: applicant }),
  })
);
