import type { PermissionStatus } from "@/clients/shared/types";

// 테스트용 회사 지갑 주소
// 실제로는 @mysten/dapp-kit의 useCurrentAccount()로 가져옴
export const TEST_COMPANY_ADDRESSES = {
  COMPANY_A: "0xCompanyA111111111111111111111111111111",
  COMPANY_B: "0xCompanyB222222222222222222222222222222",
  COMPANY_C: "0xCompanyC333333333333333333333333333333",
} as const;

/**
 * 개발용 현재 회사 주소
 * - 환경변수 NEXT_PUBLIC_DEV_COMPANY로 설정 가능
 * - 값: "A", "B", "C" 또는 직접 지갑 주소
 * - 예: NEXT_PUBLIC_DEV_COMPANY=A
 */
const getDevCompany = (): string | undefined => {
  const devCompany = process.env.NEXT_PUBLIC_DEV_COMPANY;
  if (!devCompany) return undefined;

  // A, B, C 단축키 지원
  if (devCompany === "A") return TEST_COMPANY_ADDRESSES.COMPANY_A;
  if (devCompany === "B") return TEST_COMPANY_ADDRESSES.COMPANY_B;
  if (devCompany === "C") return TEST_COMPANY_ADDRESSES.COMPANY_C;

  // 직접 주소 입력
  return devCompany;
};

export const DEV_CURRENT_COMPANY = getDevCompany();

// 테스트용 회사 정보
export const TEST_COMPANIES = [
  { address: TEST_COMPANY_ADDRESSES.COMPANY_A, name: "A회사" },
  { address: TEST_COMPANY_ADDRESSES.COMPANY_B, name: "B회사" },
  { address: TEST_COMPANY_ADDRESSES.COMPANY_C, name: "C회사" },
] as const;

// 목데이터(회사별, 이력서별 권한 상태)
// 키: 회사 지갑 주소
// 값: { blobId: PermissionStatus | null }
// 테스트 시 다른 지갑으로 연결하면 다른 권한 상태를 볼 수 있음
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

// 현재 회사의 권한 상태를 가져오는 헬퍼 함수
// 등록되지 않은 회사는 모두 null (요청 안함) 반환
export const getPermissionStatusForCompany = (
  companyAddress: string | undefined,
  blobId: string
): PermissionStatus | null => {
  if (!companyAddress) return null;

  const companyPermissions = mockPermissionStatusByCompany[companyAddress];
  if (!companyPermissions) return null;

  return companyPermissions[blobId] ?? null;
};
