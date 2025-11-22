import { applicants } from "@/server/db/schema/applicants.schema";

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
 * 지원자 조회 결과
 */
export type Applicant = typeof applicants.$inferSelect;

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
export interface SearchResultItem {
  id: string;
  handle: string;
  position: string;
  techStack: string[];
  aiSummary: string;
  blobId: string;
  sealPolicyId: string;
  encryptionId: string;
  accessPrice: number;
  similarity: number;
  createdAt: Date;
}

/**
 * 검색 결과
 */
export interface SearchApplicantsResult {
  results: SearchResultItem[];
  total: number;
}
