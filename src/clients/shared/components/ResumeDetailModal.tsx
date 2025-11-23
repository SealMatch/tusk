"use client";

import { usePdfDownload, useRequestAccess } from "@/clients/shared/hooks";
import { useSearchResultStore } from "@/clients/shared/stores";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, Code2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ResumeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  blobId: string;
}

export function ResumeDetailModal({
  isOpen,
  onClose,
  blobId,
}: ResumeDetailModalProps) {
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();
  const [isRequesting, setIsRequesting] = useState(false);

  const companyAddress = currentAccount?.address;

  const {
    selectedApplicant,
    selectedApplicantMatchInfo: match,
    setSelectedApplicantMatchInfo,
    searchResultList,
    setSearchResultList,
  } = useSearchResultStore();

  useEffect(() => {
    if (!selectedApplicant && isOpen) {
      // If no applicant in store, close modal
      onClose();
    }
  }, [selectedApplicant, isOpen, onClose]);

  const { handleRequestAccess } = useRequestAccess({
    policyObjectId: selectedApplicant?.sealPolicyId || "",
    accessPrice: "10000000",
  });

  const handlePermissionRequest = async () => {
    if (!selectedApplicant || !companyAddress) return;
    try {
      setIsRequesting(true);

      // 1. Request access and get viewRequestId
      const viewRequestId = await handleRequestAccess();

      if (!viewRequestId) {
        throw new Error("Failed to get viewRequestId from access request");
      }

      // 2. Call match API to create match record
      const matchResponse = await fetch("/api/v1/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recruiterWalletAddress: companyAddress,
          applicantId: selectedApplicant.id,
          viewRequestId,
        }),
      });

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(errorData.errorMessage || "Failed to create match");
      }

      const matchResult = await matchResponse.json();
      console.log("Match created successfully:", matchResult);
      setSelectedApplicantMatchInfo(matchResult.data);

      // Update searchResultList with new match info
      const updatedList = searchResultList.map((item) =>
        item.applicant.id === selectedApplicant.id
          ? { ...item, match: matchResult.data }
          : item
      );
      setSearchResultList(updatedList);

      // 3. Invalidate queries to refresh status
      queryClient.invalidateQueries({
        queryKey: ["viewRequestStatus", companyAddress, blobId],
      });

      // 4. Invalidate search results to re-fetch with updated match info
      queryClient.invalidateQueries({
        queryKey: ["selected-history-results"],
      });
    } catch (e) {
      console.error("Permission request failed", e);
      throw e;
    } finally {
      setIsRequesting(false);
    }
  };

  const { downloadStatus, isDownloading, handleDownload } = usePdfDownload({
    blobId,
    sealPolicyId: selectedApplicant?.sealPolicyId || "",
    currentAccountAddress: companyAddress || "",
  });

  // const { data: onChainStatus } = useViewRequestStatus({
  //   recruiterAddress: companyAddress,
  //   candidateId: blobId,
  // });

  if (!isOpen || !selectedApplicant) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[#2f2f2f] rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#2f2f2f] border-b border-gray-700 p-6 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">
              @{selectedApplicant.handle}
            </h1>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-5">
              {/* Position */}
              <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-purple-300/70 uppercase tracking-wider mb-1">
                    Target Position
                  </h4>
                  <p className="text-lg font-semibold text-white tracking-tight">
                    {selectedApplicant.position || "직무 정보 없음"}
                  </p>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <Code2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-blue-300/70 uppercase tracking-wider mb-2">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.techStack?.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                      >
                        {tech}
                      </span>
                    )) || (
                      <span className="text-gray-500 text-sm">
                        기술 스택 정보 없음
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-emerald-300/70 uppercase tracking-wider mb-2">
                    AI Analysis
                  </h4>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 leading-relaxed">
                    {selectedApplicant.aiSummary || "정보 없음"}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              {match?.status === "approved" ? (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading
                    ? "다운로드 중..."
                    : downloadStatus || "이력서 다운로드"}
                </button>
              ) : match?.status === "pending" ? (
                <button
                  disabled
                  className="w-full px-6 py-3 rounded-lg bg-yellow-600/50 text-white font-medium cursor-not-allowed"
                >
                  열람 승인 대기 중
                </button>
              ) : (
                <button
                  onClick={handlePermissionRequest}
                  disabled={isRequesting}
                  className="w-full px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequesting ? "요청 중..." : "열람 권한 요청"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
