"use client";

import { SkillBadge } from "@/clients/shared/components";
import {
  getMockResumeDetail,
  requestPermission,
  DEV_CURRENT_COMPANY,
  simulatePdfDownload,
} from "@/clients/shared/mocks";
import { Button } from "@/clients/shared/ui";
import { downloadAndDecryptPdf, downloadBlob } from "@/clients/shared/utils";
import { useCurrentAccount, ConnectModal, useSignAndExecuteTransaction, useSuiClient, useSignPersonalMessage } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Clock, CheckCircle, XCircle, Wallet, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

// 스마트 컨트랙트 상수
const PACKAGE_ID = "0xb35fbef347e1a4ea13adb7bd0f24f6c9e82117f5715da28dbf8924539bd2178a";

export default function ResumeDetailPage() {
  const params = useParams();
  const blobId = params.blobId as string;
  const queryClient = useQueryClient();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  // 실제 지갑이 연결되면 그 주소 사용, 아니면 개발용 테스트 회사 사용
  const companyAddress = currentAccount?.address || DEV_CURRENT_COMPANY;

  const { data, isLoading, error } = useQuery({
    queryKey: ["resume", blobId, companyAddress],
    queryFn: () => {
      return getMockResumeDetail(blobId, companyAddress);
    },
    enabled: !!blobId,
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      // 지갑이 연결되어 있으면 실제 Sui 트랜잭션 호출
      if (currentAccount?.address) {
        const tx = new Transaction();

        // blobId를 vector<u8>로 변환
        const candidateIdBytes = Array.from(new TextEncoder().encode(blobId));

        tx.moveCall({
          target: `${PACKAGE_ID}::view_request::create`,
          arguments: [
            tx.pure.address(currentAccount.address), // recruiter
            tx.pure.vector('u8', candidateIdBytes),  // candidate_id (blobId)
          ],
        });

        return new Promise((resolve, reject) => {
          signAndExecuteTransaction(
            {
              transaction: tx,
            },
            {
              onSuccess: async (result) => {
                // 트랜잭션 완료 대기
                await suiClient.waitForTransaction({
                  digest: result.digest,
                });

                // Mock 상태도 업데이트 (개발용)
                await requestPermission(blobId, companyAddress);

                resolve({ success: true, newStatus: "pending" as const });
              },
              onError: (error) => {
                console.error("Transaction failed:", error);
                reject(error);
              },
            }
          );
        });
      }

      // 개발 모드: Mock 함수 사용
      return requestPermission(blobId, companyAddress);
    },
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
    // 지갑이 연결되어 있으면 실제 Walrus + Seal 다운로드
    if (currentAccount?.address && data?.resume.sealPolicyId) {
      setIsDownloading(true);
      setDownloadStatus("");

      try {
        const result = await downloadAndDecryptPdf(
          blobId,
          data.resume.sealPolicyId,
          suiClient,
          currentAccount.address,
          signPersonalMessage,
          (progress) => {
            setDownloadStatus(progress.message);
          }
        );

        if (result.success && result.blob) {
          downloadBlob(result.blob, `resume_${blobId.slice(0, 8)}.pdf`);
          setDownloadStatus("✅ 다운로드 완료!");
          setTimeout(() => {
            setDownloadStatus("");
            setIsDownloading(false);
          }, 2000);
        } else {
          setDownloadStatus(`❌ ${result.error || "다운로드 실패"}`);
          setIsDownloading(false);
        }
      } catch (error) {
        console.error("PDF download error:", error);
        setDownloadStatus("❌ 다운로드 실패");
        setIsDownloading(false);
      }
      return;
    }

    // 개발 모드: Mock 시뮬레이션 사용
    setIsDownloading(true);
    setDownloadStatus("");

    try {
      await simulatePdfDownload(blobId, (step) => {
        setDownloadStatus(step.message);
      });

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
  const isConnected = !!(currentAccount?.address || DEV_CURRENT_COMPANY);

  // 권한 상태에 따른 단일 버튼 렌더링
  const renderActionButton = () => {
    // 0. 미연결 상태 → 지갑 연결 버튼 (파란색)
    if (!isConnected) {
      return (
        <ConnectModal
          trigger={
            <Button variant="default" className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Wallet className="h-5 w-5" />
              지갑 연결하고 권한 요청
            </Button>
          }
        />
      );
    }

    // 1. 승인됨 → PDF 다운로드 버튼 (초록색)
    if (myPermissionStatus === "approved") {
      return (
        <div className="space-y-2">
          <Button
            variant="default"
            className="w-full h-12 gap-2 bg-green-600 hover:bg-green-700 text-white border-none disabled:bg-green-800 disabled:opacity-100"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                다운로드 중...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                PDF 다운로드
              </>
            )}
          </Button>
          {downloadStatus && (
            <p className="text-sm text-center text-gray-400">{downloadStatus}</p>
          )}
        </div>
      );
    }

    // 2. 요청 중 → 권한 요청 중 버튼 (진한 노란색/주황색 Solid)
    // disabled 상태여도 흐려지지 않게 opacity-100 적용
    if (myPermissionStatus === "pending" || requestMutation.isPending) {
      return (
        <Button
          variant="default"
          className="w-full h-12 gap-2 bg-amber-600 text-white border-none disabled:opacity-100 cursor-not-allowed"
          disabled
        >
          <Clock className="h-5 w-5" />
          권한 요청 중 (승인 대기)
        </Button>
      );
    }

    // 3. 거절됨 → 거절됨 버튼 (진한 빨간색 Solid)
    // disabled 상태여도 흐려지지 않게 opacity-100 적용
    if (myPermissionStatus === "rejected") {
      return (
        <Button
          variant="default"
          className="w-full h-12 gap-2 bg-red-600 text-white border-none disabled:opacity-100 cursor-not-allowed"
          disabled
        >
          <XCircle className="h-5 w-5" />
          거절됨
        </Button>
      );
    }

    // 4. null (요청한 적 없음) → 권한 요청 버튼 (파란색)
    return (
      <Button
        variant="default"
        className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800"
        onClick={handleRequestPermission}
        disabled={requestMutation.isPending}
      >
        {requestMutation.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            요청 중...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            권한 요청
          </>
        )}
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