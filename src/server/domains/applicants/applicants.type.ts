import { Applicant } from "@/server/db/schema/applicants.schema";

// Re-export Applicant from schema
export type { Applicant };

/**
 * 지원자 생성 요청 파라미터
 */
export interface CreateApplicantParams {
  handle: string;
  walletAddress: string;
  position: string;
  techStack: string[];
  aiSummary: string;
  blobId?: string;
  sealPolicyId?: string;
  encryptionId?: string;
  capId?: string;
  accessPrice?: number;
  isJobSeeking?: boolean;
}

/**
 * 지원자 DB 저장 데이터
 */
export interface CreateApplicantData extends CreateApplicantParams {
  embedding: number[];
}

/**
 * 공개용 지원자 정보 (임베딩 제외)
 */
export type PublicApplicant = Omit<Applicant, "embedding">;

/**
 * 지원자 생성 결과
 */
export interface CreateApplicantResult {
  id: string;
}

/**
 * 검색 요청 파라미터
 */
export interface SearchApplicantsParams {
  query: string;
  limit?: number;
}

/**
 * 검색 결과 아이템
 */
export interface SearchResultItem extends PublicApplicant {
  similarity: number;
}

/**
 * 검색 결과
 */
export interface SearchApplicantsResult {
  results: SearchResultItem[];
  total: number;
}
