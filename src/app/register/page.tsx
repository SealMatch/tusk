"use client";

import { useUserStore } from "@/clients/shared/stores";
import { Button } from "@/clients/shared/ui/button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Building2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { setUserType, isRegistered } = useUserStore();

  // 지갑 미연결 시 홈으로
  useEffect(() => {
    if (!currentAccount) {
      router.push("/");
    }
  }, [currentAccount, router]);

  // 이미 가입된 사용자면 홈으로
  useEffect(() => {
    if (currentAccount && isRegistered(currentAccount.address)) {
      router.push("/");
    }
  }, [currentAccount, isRegistered, router]);

  if (!currentAccount) {
    return null;
  }

  const handleSelectCompany = () => {
    setUserType(currentAccount.address, "company");
    router.push("/register/company");
  };

  const handleSelectJobseeker = () => {
    setUserType(currentAccount.address, "jobseeker");
    router.push("/register/jobseeker");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">회원가입</h1>
          <p className="text-gray-400">회원 유형을 선택해주세요</p>
        </div>

        <div className="space-y-4">
          {/* 회사 선택 */}
          <button
            onClick={handleSelectCompany}
            className="w-full p-6 bg-[#2f2f2f] border border-gray-700 rounded-xl hover:border-blue-500 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">회사</h2>
                <p className="text-sm text-gray-400">
                  인재를 검색하고 이력서를 열람합니다
                </p>
              </div>
            </div>
          </button>

          {/* 구직자 선택 */}
          <button
            onClick={handleSelectJobseeker}
            className="w-full p-6 bg-[#2f2f2f] border border-gray-700 rounded-xl hover:border-green-500 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <User className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">구직자</h2>
                <p className="text-sm text-gray-400">
                  이력서를 등록하고 권한을 관리합니다
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
