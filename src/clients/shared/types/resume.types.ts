/**
 * 열람 권한 상태
 * - 채용담당자가 구직자의 이력서 열람을 요청하면 생성됨
 * - null인 경우 아직 요청한 적 없음을 의미
 */
export type PermissionStatus =
  | "pending" // 요청 중 (구직자의 승인 대기)
  | "approved" // 승인됨 (PDF 다운로드 가능)
  | "rejected"; // 거절됨

/**
 * 이력서 기본 정보
 * - 구직자가 업로드한 이력서의 메타데이터
 * - Walrus 스토리지에 저장된 PDF 파일과 연결됨
 */
export interface ResumeDetail {
  blobId: string; // Walrus 스토리지의 파일 식별자
  skills: string[];
  position: string;
  experienceDetail: string;
  education: string;
  introduction: string;
  etc?: string;
  createdAt: string;
  ownerAddress: string; // 이력서 소유자(구직자)의 지갑 주소
}

/**
 * 이력서 상세 조회 API 응답
 * - 이력서 정보 + 현재 조회자의 권한 상태를 함께 반환
 * - 같은 이력서라도 조회하는 사용자(회사)마다 권한 상태가 다름
 */
export interface ResumeDetailResponse {
  resume: ResumeDetail;
  myPermissionStatus: PermissionStatus | null; // null = 요청한 적 없음
}

/**
 * 권한 요청 기록
 * - 채용담당자가 구직자에게 열람 권한을 요청하면 생성됨
 * - 구직자는 이를 승인하거나 거절할 수 있음
 */
export interface PermissionRequest {
  id: string;
  blobId: string;
  requesterAddress: string; // 요청자 (채용담당자)
  ownerAddress: string; // 소유자 (구직자)
  status: PermissionStatus;
  requestedAt: string;
  respondedAt?: string;
}
