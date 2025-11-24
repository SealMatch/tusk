"use client";

import { ResumeDetailModal, SkillBadge } from "@/clients/shared/components";
import { customAxios } from "@/clients/shared/libs/axios.libs";
import { useSearchResultStore } from "@/clients/shared/stores";
import { SearchResultCard } from "@/server/domains/histories/history.type";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SkillStackPreview({
  skills,
  getSortedSkills,
}: {
  skills: string[];
  getSortedSkills: (skills: string[]) => string[];
}) {
  const sortedSkills = getSortedSkills(skills);
  const displaySkills = sortedSkills.slice(0, 2);
  const remainingCount = sortedSkills.length - 2;

  return (
    <div className="h-[44px] mb-3">
      <p className="text-xs text-gray-400 mb-1.5 font-bold">Skill Stack</p>
      <div className="flex items-center gap-1.5 overflow-hidden">
        {displaySkills.map((skill) => (
          <SkillBadge key={skill} skill={skill} className="text-xs shrink-0" />
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
            ...
          </span>
        )}
      </div>
    </div>
  );
}

function SearchResultsPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const recruiterWalletAddress = useCurrentAccount()?.address;
  const {
    searchResultList,
    setSearchResultList,
    setSelectedApplicant,
    setSelectedApplicantMatchInfo,
  } = useSearchResultStore();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlobId, setSelectedBlobId] = useState("");

  const {
    data: searchResultCards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["selected-history-results", query, recruiterWalletAddress],
    queryFn: async () => {
      // Generate unique historyId for this search to prevent duplicate saves
      const historyId = crypto.randomUUID();

      const response = await customAxios.get(`/api/v1/search`, {
        params: {
          query: query,
          limit: 20,
        },
        headers: {
          "X-Wallet-Address": recruiterWalletAddress,
          "X-History-Id": historyId,
        },
      });
      const searchResultCards = response.data.data
        .results as SearchResultCard[];
      return searchResultCards;
    },
    enabled: !!query,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent unnecessary refetches
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 1, // Only retry once on failure (default is 3)
  });

  useEffect(() => {
    if (searchResultCards) {
      setSearchResultList(searchResultCards);

      // 검색 성공 후 히스토리 갱신
      queryClient.invalidateQueries({
        queryKey: ["search-history", recruiterWalletAddress],
      });
    }
  }, [searchResultCards, setSearchResultList, queryClient, recruiterWalletAddress]);

  const handleCardClick = (selectedResult: SearchResultCard) => {
    if (!selectedResult) return;

    const { applicant, match } = selectedResult;
    if (!applicant.blobId) return;

    setSelectedApplicant(applicant);
    setSelectedBlobId(applicant.blobId);
    setIsModalOpen(true);
    setSelectedApplicantMatchInfo(match);
  };

  // 검색 키워드와 매칭되는 스킬을 앞으로 정렬
  const getSortedSkills = (skills: string[]) => {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const matched = skills.filter((skill) => {
      const skillLower = skill.toLowerCase();
      return queryWords.some(
        (word) => skillLower.includes(word) || word.includes(skillLower)
      );
    });

    // 매칭된 스킬이 없으면 원래 순서 유지
    if (matched.length === 0) {
      return skills;
    }

    const unmatched = skills.filter((skill) => {
      const skillLower = skill.toLowerCase();
      return !queryWords.some(
        (word) => skillLower.includes(word) || word.includes(skillLower)
      );
    });

    return [...matched, ...unmatched];
  };

  // 중복 제거 + similarity 기준 정렬
  const sortedResults = searchResultList
    ? Object.values(
        searchResultList.reduce((acc, item) => {
          const blobId = item.applicant.blobId || item.applicant.id;
          // blobId가 없거나, 기존 항목보다 similarity가 높으면 업데이트
          if (!acc[blobId] || acc[blobId].similarity < item.similarity) {
            acc[blobId] = item;
          }
          return acc;
        }, {} as Record<string, SearchResultCard>)
      ).sort((a, b) => b.similarity - a.similarity)
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Searching...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Search error occurred.</div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* 결과 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-2">Result</h1>
        <p className="text-sm text-gray-400">
          Found {sortedResults.length} results
        </p>
      </div>

      {/* 결과 그리드 - 3열 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {sortedResults.map((result) => (
          <button
            key={result.applicant.id}
            onClick={() => handleCardClick(result)}
            disabled={!result.applicant.blobId}
            className="bg-[#2f2f2f] rounded-xl p-5 text-left hover:bg-[#3a3a3a] transition-colors border border-gray-700 hover:border-gray-600 flex flex-col min-h-[240px] relative disabled:opacity-50 disabled:cursor-not-allowed">
            {/* 상단 정보: 핸들 & 유사도 */}
            <div className="flex justify-between items-center mb-1 w-full">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-500/15 text-blue-400 text-xs font-semibold rounded-md whitespace-nowrap">
                  Similarity: {(result.similarity * 100).toFixed(0)}%
                </span>
                {result.match && (
                  <span
                    className={`px-2.5 py-1 text-xs bg-white/90 font-semibold rounded-md whitespace-nowrap ${
                      result.match.status === "pending"
                        ? "text-yellow-400"
                        : result.match.status === "accepted"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}>
                    {result.match.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* 직무 */}
            <div className="mb-0.5 w-full">
              <p className="text-white font-semibold text-base truncate pr-2">
                {result.applicant.position || "Unknown Position"}
              </p>

              <span className="text-xs text-gray-400 font-medium truncate max-w-[60%]">
                @{result.applicant.handle}
              </span>
            </div>

            {/* 가격 정보 */}
            <div className="mb-0.5">
              <span className="text-xs text-gray-500">
                Access: {result.applicant.accessPrice ?? 0} WAL
              </span>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-700 my-2" />

            <SkillStackPreview
              skills={result.applicant.techStack || []}
              getSortedSkills={getSortedSkills}
            />

            <p className="text-sm text-gray-400 line-clamp-2 max-h-10">
              {result.applicant.aiSummary || "No summary available"}
            </p>
          </button>
        ))}
      </div>

      {/* 결과 없음 */}
      {sortedResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl font-semibold text-gray-300 mb-2">
            No matching candidates found
          </p>
          <p className="text-sm text-gray-500">Try a different keyword</p>
        </div>
      )}

      {/* Resume Detail Modal */}
      <ResumeDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        blobId={selectedBlobId}
      />
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400">로딩 중...</div>
        </div>
      }>
      <SearchResultsPageContent />
    </Suspense>
  );
}
