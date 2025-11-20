// 회원 타입
export type UserType = "company" | "jobseeker";

// 회사 정보 (최소 버전)
export interface CompanyInfo {
  name: string;
  email: string;
}

// 회원 프로필
export interface UserProfile {
  walletAddress: string;
  userType: UserType;
  companyInfo?: CompanyInfo;
  createdAt: string;
}
