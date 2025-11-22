import { Match } from "@/server/db/schema/matches.schema";
import { Applicant } from "../applicants/applicants.type";

/**
 * Repository layer parameter - for DB storage
 */
export interface CreateHistoryParams {
  id: string;
  recruiterWalletAddress: string;
  query: string;
  result: SearchResultItem[]; // applicant IDs only (stored in DB)
  createdAt: Date;
}

/**
 * Search result item - used in Service layer
 */
export interface SearchResultItem {
  applicantId: string;
  similarity: number;
  createdAt: Date;
}

export interface SearchResultCard {
  applicant: Applicant;
  match: Match | null;
  similarity: number;
  createdAt: Date;
}
