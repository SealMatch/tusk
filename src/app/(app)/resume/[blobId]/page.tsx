"use client";

import { SkillBadge } from "@/clients/shared/components";
import {
  getMockResumeDetail,
  requestPermission,
  DEV_CURRENT_COMPANY,
  simulatePdfDownload,
} from "@/clients/shared/mocks";
import type { PermissionStatus } from "@/clients/shared/types";
import { Button } from "@/clients/shared/ui";
import { useCurrentAccount, ConnectModal } from "@mysten/dapp-kit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Clock, CheckCircle, XCircle, Wallet } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ResumeDetailPage() {
  const params = useParams();
  const blobId = params.blobId as string;
  const queryClient = useQueryClient();
  const currentAccount = useCurrentAccount();

  // 실제 지갑이 연결되면 그 주소 사용, 아니면 개발용 테스트 회사 사용
  const companyAddress = currentAccount?.address || DEV_CURRENT_COMPANY;

  const { data, isLoading, error } = useQuery({
    queryKey: ["resume", blobId, companyAddress],
    queryFn: () => {
      // TODO: 실제 API 연동
      return getMockResumeDetail(blobId, companyAddress);
    },
    enabled: !!blobId,
  });

  const requestMutation = useMutation({
    mutationFn: () => requestPermission(blobId, companyAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume", blobId, companyAddress] });
    },
  });

  const handleRequestPermission = () => {
    requestMutation.mutate();
  };

  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadStatus("");

    try {
      await simulatePdfDownload(blobId, (step) => {
        setDownloadStatus(step.message);
      });

      // 다운로드 완료 후 상태 초기화
      setTimeout(() => {
        setDownloadStatus("");
        setIsDownloading(false);
      }, 2000);
    } catch (error) {
      setDownloadStatus("❌ 다운로드 실패");
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">이력서를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const { resume, myPermissionStatus } = data;

  // 연결 여부 확인
  const isConnected = !!(currentAccount?.address || DEV_CURRENT_COMPANY);

  // 권한 상태에 따른 단일 버튼 렌더링
  // 항상 하나의 버튼만 표시됨
  const renderActionButton = () => {
    // 0. 미연결 상태 → 지갑 연결 버튼
    if (!isConnected) {
      return (
        <ConnectModal
          trigger={
            <Button variant="default" className="w-full h-12 gap-2">
              <Wallet className="h-4 w-4" />
              지갑 연결하고 권한 요청
            </Button>
          }
        />
      );
    }

    // 1. 승인됨 → PDF 다운로드 버튼
    if (myPermissionStatus === "approved") {
      return (
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full h-12 text-white border-gray-600 hover:bg-gray-700"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "다운로드 중..." : "PDF 다운로드"}
            {!isDownloading && (
              <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
            )}
          </Button>
          {downloadStatus && (
            <p className="text-sm text-center text-gray-400">{downloadStatus}</p>
          )}
        </div>
      );
    }

    // 2. 요청 중 → 권한 요청 중 버튼 (비활성화)
    if (myPermissionStatus === "pending" || requestMutation.isPending) {
      return (
        <Button
          variant="outline"
          className="w-full h-12 text-gray-400 border-gray-600"
          disabled
        >
          <Clock className="h-4 w-4 mr-2" />
          권한 요청 중
        </Button>
      );
    }

    // 3. 거절됨 → 거절됨 버튼 (비활성화)
    if (myPermissionStatus === "rejected") {
      return (
        <Button
          variant="outline"
          className="w-full h-12 text-red-400 border-red-600"
          disabled
        >
          <XCircle className="h-4 w-4 mr-2" />
          거절됨
        </Button>
      );
    }

    // 4. null (요청한 적 없음) → 권한 요청 버튼
    return (
      <Button
        variant="default"
        className="w-full h-12"
        onClick={handleRequestPermission}
        disabled={requestMutation.isPending}
      >
        권한 요청
      </Button>
    );
  };

  return (
    <div className="flex-1 flex justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* 이력서 카드 */}
        <div className="bg-[#2f2f2f] rounded-xl p-6 border border-gray-700">
          {/* 직무 */}
          <h1 className="text-xl font-bold text-white mb-4">
            {resume.position}
          </h1>

          {/* 구분선 */}
          <div className="border-t border-gray-700 my-4" />

          {/* 1. 기술 스택 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-2">
              1. 기술 스택
            </h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          </div>

          {/* 2. 직무 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-2">2. 직무</h2>
            <p className="text-white">{resume.position}</p>
          </div>

          {/* 3. 자기소개 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-2">
              3. 자기소개
            </h2>
            <p className="text-white">{resume.introduction}</p>
          </div>

          {/* 버튼 영역 - 항상 하나의 버튼만 표시 */}
          <div className="mt-8">
            {renderActionButton()}
          </div>
        </div>
      </div>
    </div>
  );
}
