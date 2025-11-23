"use client";

import { SkillBadge } from "@/clients/shared/components";
import {
  usePermissionRequest,
  usePdfDownload,
  useViewRequestStatus,
} from "@/clients/shared/hooks";
import { customAxios } from "@/clients/shared/libs/axios.libs";
import { Applicant } from "@/server/db/schema/applicants.schema";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ResumeActionButton } from "./ResumeActionButton";

export default function ResumeDetailPage() {
  const params = useParams();
  // URL 파라미터는 blobId이지만 실제로는 applicantId를 전달받음
  const applicantId = params.blobId as string;
  const currentAccount = useCurrentAccount();

  const companyAddress = currentAccount!.address;

  // applicantId로 지원자 정보 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ["applicant", applicantId],
    queryFn: async () => {
      const response = await customAxios.get(`/api/v1/applicants/${applicantId}`);
      return response.data.data as Applicant;
    },
    enabled: !!applicantId,
  });

  const blobId = data?.blobId || "";

  const { requestPermission, isPending } = usePermissionRequest({
    blobId,
    companyAddress,
    currentAccountAddress: companyAddress,
  });

  const { downloadStatus, isDownloading, handleDownload } = usePdfDownload({
    blobId,
    sealPolicyId: data?.sealPolicyId || undefined,
    currentAccountAddress: companyAddress,
  });

  const { data: onChainStatus } = useViewRequestStatus({
    recruiterAddress: companyAddress,
    candidateId: blobId,
    enabled: !!blobId,
  });

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

  const myPermissionStatus = onChainStatus ?? null;

  return (
    <div className="flex-1 flex justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-[#2f2f2f] rounded-xl p-6 border border-gray-700">
          <h1 className="text-xl font-bold text-white mb-4">
            {data.position}
          </h1>

          <div className="border-t border-gray-700 my-4" />

          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-2">
              1. 기술 스택
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.techStack?.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-2">2. 직무</h2>
            <p className="text-white">{data.position}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-2">
              3. 자기소개
            </h2>
            <p className="text-white">{data.aiSummary}</p>
          </div>

          <div className="mt-8">
            <ResumeActionButton
              myPermissionStatus={myPermissionStatus}
              isDownloading={isDownloading}
              downloadStatus={downloadStatus}
              isPending={isPending}
              onDownload={handleDownload}
              onRequestPermission={requestPermission}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
