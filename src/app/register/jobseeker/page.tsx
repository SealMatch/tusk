"use client";

import { useUserStore } from "@/clients/shared/stores";
import { Button } from "@/clients/shared/ui/button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterJobseekerPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { getUser } = useUserStore();

  // 지갑 미연결 시 홈으로
  useEffect(() => {
    if (!currentAccount) {
      router.push("/");
      return;
    }

    // 구직자로 등록되지 않은 경우 register로
    const user = getUser(currentAccount.address);
    if (!user || user.userType !== "jobseeker") {
      router.push("/register");
    }
  }, [currentAccount, getUser, router]);

  if (!currentAccount) {
    return null;
  }

  const handleGoToResume = () => {
    // TODO: 이력서 등록 페이지로 이동 (다른 사람이 구현)
    // 일단은 홈으로 이동
    router.push("/");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-green-500/20 rounded-full mb-4">
            <FileText className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">가입 완료!</h1>
          <p className="text-gray-400">
            구직자로 등록되었습니다.
            <br />
            이제 이력서를 등록해주세요.
          </p>
        </div>

        <div className="bg-[#2f2f2f] border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">다음 단계</h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400">1.</span>
              이력서를 등록합니다
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">2.</span>
              회사에서 권한을 요청하면 알림을 받습니다
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">3.</span>
              요청을 승인하면 회사가 PDF를 열람할 수 있습니다
            </li>
          </ul>
        </div>

        <Button onClick={handleGoToResume} className="w-full h-12 gap-2">
          이력서 등록하기
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          * 이력서 등록 기능은 별도로 구현됩니다
        </p>
      </div>
    </div>
  );
}
