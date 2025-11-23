import type { ResumeResult } from "./resume.types";

export interface SearchResponse {
  results: ResumeResult[];
  total: number;
}

export interface SearchQuery {
  query: string;
}

// ResumeResult는 resume.types.ts에서 export됨

export type MatchStatus = "pending" | "accepted" | "rejected";
