"use client";

import { useUserStore } from "@/clients/shared/stores";
import { Button } from "@/clients/shared/ui/button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterCompanyPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { setCompanyInfo, getUser, isCompany } = useUserStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 지갑 미연결 시 홈으로
  useEffect(() => {
    if (!currentAccount) {
      router.push("/");
      return;
    }

    // 회사로 등록되지 않은 경우 register로
    if (!isCompany(currentAccount.address)) {
      router.push("/register");
    }
  }, [currentAccount, isCompany, router]);

  if (!currentAccount) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      return;
    }

    setIsSubmitting(true);

    // TODO: 실제로는 백엔드에 저장 (지갑주소 + salt)
    setCompanyInfo(currentAccount.address, {
      name: name.trim(),
      email: email.trim(),
    });

    // 가입 완료 후 검색 페이지로
    router.push("/search");
  };

  const isValid = name.trim() && email.trim() && email.includes("@");

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">회사 정보 입력</h1>
          <p className="text-gray-400">기본 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 회사명 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              회사명 *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="회사명을 입력하세요"
              className="w-full px-4 py-3 bg-[#2f2f2f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* 이메일 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              담당자 이메일 *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@company.com"
              className="w-full px-4 py-3 bg-[#2f2f2f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* 안내 문구 */}
          <p className="text-xs text-gray-500">
            * 입력하신 정보는 구직자가 권한 요청을 승인/거절할 때 참고됩니다.
          </p>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            className="w-full h-12"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "가입 완료"}
          </Button>
        </form>
      </div>
    </div>
  );
}
