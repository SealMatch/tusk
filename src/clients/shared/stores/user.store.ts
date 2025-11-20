import type { UserProfile, UserType, CompanyInfo } from "@/clients/shared/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  // 주소별 회원 정보 (실제로는 백엔드에서 관리)
  users: Record<string, UserProfile>;

  // 현재 주소의 회원 정보 조회
  getUser: (address: string | undefined) => UserProfile | null;

  // 회원 타입 설정 (온보딩 시)
  setUserType: (address: string, userType: UserType) => void;

  // 회사 정보 설정
  setCompanyInfo: (address: string, companyInfo: CompanyInfo) => void;

  // 회원 여부 확인
  isRegistered: (address: string | undefined) => boolean;

  // 회사인지 확인
  isCompany: (address: string | undefined) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: {},

      getUser: (address) => {
        if (!address) return null;
        return get().users[address] || null;
      },

      setUserType: (address, userType) => {
        set((state) => ({
          users: {
            ...state.users,
            [address]: {
              walletAddress: address,
              userType,
              createdAt: new Date().toISOString(),
            },
          },
        }));
      },

      setCompanyInfo: (address, companyInfo) => {
        set((state) => {
          const existingUser = state.users[address];
          if (!existingUser) return state;

          return {
            users: {
              ...state.users,
              [address]: {
                ...existingUser,
                companyInfo,
              },
            },
          };
        });
      },

      isRegistered: (address) => {
        if (!address) return false;
        return !!get().users[address];
      },

      isCompany: (address) => {
        if (!address) return false;
        const user = get().users[address];
        return user?.userType === "company";
      },
    }),
    {
      name: "seal-match-user",
    }
  )
);
