// 열람 권한 상태(채용담당자가 구직자의 이력서 열람을 요청하면 생성됨)
// null인 경우 아직 요청한 적 없음을 의미
export type PermissionStatus =
  | "pending" // 요청 중 (구직자의 승인 대기)
  | "approved" // 승인됨 (PDF 다운로드 가능)
  | "rejected"; // 거절됨

// 이력서 기본 정보 (검색 결과에 표시)
export interface ResumeBase {
  blobId: string; // Walrus 스토리지의 파일 식별자
  skills: string[];
  position: string;
  experienceDetail: string;
  education: string;
  introduction: string;
  etc?: string;
  createdAt: string;
}

// 검색 결과용 이력서 (ResumeBase와 동일)
export type ResumeResult = ResumeBase;

// 이력서 상세 정보 (소유자 주소 포함)
export interface ResumeDetail extends ResumeBase {
  ownerAddress: string; // 이력서 소유자(구직자)의 지갑 주소
  sealPolicyId: string; // Seal 암호화 정책 ID (복호화 시 필요)
}

// 이력서 상세 조회 API 응답
// 이력서 정보 + 현재 조회자의 권한 상태를 함께 반환
export interface ResumeDetailResponse {
  resume: ResumeDetail;
  myPermissionStatus: PermissionStatus | null; // null = 요청한 적 없음
}

// 권한 요청 기록
export interface PermissionRequest {
  id: string;
  blobId: string;
  requesterAddress: string; // 요청자 (채용담당자)
  ownerAddress: string; // 소유자 (구직자)
  status: PermissionStatus;
  requestedAt: string;
  respondedAt?: string;
}
