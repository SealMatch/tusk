import type { PermissionStatus } from "@/clients/shared/types";

/**
 * 테스트용 회사 지갑 주소
 * - 실제로는 @mysten/dapp-kit의 useCurrentAccount()로 가져옴
 * - 테스트 시 다른 지갑으로 연결하면 다른 회사로 로그인한 것
 */
export const TEST_COMPANY_ADDRESSES = {
  COMPANY_A: "0xCompanyA111111111111111111111111111111",
  COMPANY_B: "0xCompanyB222222222222222222222222222222",
  COMPANY_C: "0xCompanyC333333333333333333333333333333",
} as const;

/**
 * 개발용: 현재 테스트 중인 회사
 * - 지갑 연결 없이 테스트할 때 사용
 * - 이 값을 변경하면 다른 회사로 로그인한 것처럼 테스트 가능
 * - 실제 지갑이 연결되면 이 값은 무시됨
 */
export const DEV_CURRENT_COMPANY = TEST_COMPANY_ADDRESSES.COMPANY_B;
// export const DEV_CURRENT_COMPANY = TEST_COMPANY_ADDRESSES.COMPANY_B;
// export const DEV_CURRENT_COMPANY = TEST_COMPANY_ADDRESSES.COMPANY_C;

/**
 * 테스트용 회사 정보
 */
export const TEST_COMPANIES = [
  { address: TEST_COMPANY_ADDRESSES.COMPANY_A, name: "A회사" },
  { address: TEST_COMPANY_ADDRESSES.COMPANY_B, name: "B회사" },
  { address: TEST_COMPANY_ADDRESSES.COMPANY_C, name: "C회사" },
] as const;

/**
 * 목데이터: 회사별, 이력서별 권한 상태
 * - 키: 회사 지갑 주소
 * - 값: { blobId: PermissionStatus | null }
 * - 테스트 시 다른 지갑으로 연결하면 다른 권한 상태를 볼 수 있음
 */
export const mockPermissionStatusByCompany: Record<
  string,
  Record<string, PermissionStatus | null>
> = {
  // A회사: 4가지 상태를 모두 테스트할 수 있도록 설정
  [TEST_COMPANY_ADDRESSES.COMPANY_A]: {
    "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12": "approved", // 승인됨
    "0x2b3c4d5e6f7890abcdef1234567890abcdef1234": "pending", // 요청 중
    "0x3c4d5e6f7890abcdef1234567890abcdef123456": null, // 요청 안함
    "0x4d5e6f7890abcdef1234567890abcdef12345678": "rejected", // 거절됨
    "0x5e6f7890abcdef1234567890abcdef1234567890": null, // 요청 안함
    "0x6f7890abcdef1234567890abcdef12345678901a": null, // 요청 안함
  },
  // B회사: A회사와 다른 권한 상태
  [TEST_COMPANY_ADDRESSES.COMPANY_B]: {
    "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12": "pending", // A회사는 approved
    "0x2b3c4d5e6f7890abcdef1234567890abcdef1234": "approved", // A회사는 pending
    "0x3c4d5e6f7890abcdef1234567890abcdef123456": "rejected", // A회사는 null
    "0x4d5e6f7890abcdef1234567890abcdef12345678": null, // A회사는 rejected
    "0x5e6f7890abcdef1234567890abcdef1234567890": "approved",
    "0x6f7890abcdef1234567890abcdef12345678901a": "pending",
  },
  // C회사: 모두 요청 안함 (신규 회사 시뮬레이션)
  [TEST_COMPANY_ADDRESSES.COMPANY_C]: {
    "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12": null,
    "0x2b3c4d5e6f7890abcdef1234567890abcdef1234": null,
    "0x3c4d5e6f7890abcdef1234567890abcdef123456": null,
    "0x4d5e6f7890abcdef1234567890abcdef12345678": null,
    "0x5e6f7890abcdef1234567890abcdef1234567890": null,
    "0x6f7890abcdef1234567890abcdef12345678901a": null,
  },
};

/**
 * 현재 회사의 권한 상태를 가져오는 헬퍼 함수
 * - 등록되지 않은 회사는 모두 null (요청 안함) 반환
 */
export const getPermissionStatusForCompany = (
  companyAddress: string | undefined,
  blobId: string
): PermissionStatus | null => {
  if (!companyAddress) return null;

  const companyPermissions = mockPermissionStatusByCompany[companyAddress];
  if (!companyPermissions) return null;

  return companyPermissions[blobId] ?? null;
};
