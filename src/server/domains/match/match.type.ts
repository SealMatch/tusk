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
  viewRequestId: string; // 온체인 접근 요청 ID (필수)
}

/**
 * Match creation data for repository
 */
export interface CreateMatchData {
  id: string;
  recruiterWalletAddress: string;
  applicantId: string;
  viewRequestId: string; // 온체인 접근 요청 ID (필수)
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
  userHandle: string;
  currentApplicant: Applicant | null; // 현재 사용자의 applicant 정보 (승인/거절 시 필요)
  requestedList: RequestedItem[]; // 내가 요청한 applicant들
  receivedList: ReceivedItem[]; // 나에게 요청을 보낸 recruiter들
}

// 내가 요청한 매치 (recruiter 입장)
export interface RequestedItem {
  applicant: Applicant;
  match: Match;
}

// 내가 받은 매치 요청 (applicant 입장)
export interface ReceivedItem {
  recruiterWalletAddress: string;
  match: Match;
}
