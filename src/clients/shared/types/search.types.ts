// blobId는 BigInt 오버플로우 방지를 위해 string 타입으로 처리
export interface ResumeResult {
  blobId: string; // 내부 식별자 (UI에 노출하지 않음)
  skills: string[];
  position: string;
  experienceDetail: string; // 경력 상세
  education: string; // 학력
  introduction: string; // 자기소개
  etc?: string; // 기타
  createdAt: string;
  // TODO: 매칭률 구현 시 추가
  // matchRate?: number; // 0-100 사이 값
}

export interface SearchResponse {
  results: ResumeResult[];
  total: number;
}

export interface SearchQuery {
  query: string;
}
