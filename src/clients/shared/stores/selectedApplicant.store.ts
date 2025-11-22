import { PublicApplicant } from "@/server/domains/applicants/applicants.type";
import { create } from "zustand";

interface SelectedApplicantStore {
    selectedApplicant: PublicApplicant | null;
    setSelectedApplicant: (applicant: PublicApplicant | null) => void;
}

export const useSelectedApplicantStore = create<SelectedApplicantStore>((set) => ({
    selectedApplicant: null,
    setSelectedApplicant: (applicant) => set({ selectedApplicant: applicant }),
}));
