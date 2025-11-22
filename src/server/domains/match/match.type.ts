import { Match } from "@/server/db/schema/matches.schema";
import { Applicant } from "../applicants/applicants.type";

/**
 * Match status type
 */
export type MatchStatus = "pending" | "approved" | "rejected";

/**
 * Create match request parameter
 */
export interface CreateMatchParams {
  recruiterWalletAddress: string;
  applicantId: string;
}

/**
 * Match creation data for repository
 */
export interface CreateMatchData {
  id: string;
  recruiterWalletAddress: string;
  applicantId: string;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Update match status parameter
 */
export interface UpdateMatchStatusParams {
  matchId: string;
  status: MatchStatus;
  applicantWalletAddress: string;
}

export interface ProfilePageDataResponse {
  requestedList: ProfilePageDataItem[];
  receivedList: ProfilePageDataItem[];
}

export interface ProfilePageDataItem {
  applicant: Applicant;
  match: Match;
}
