"use client";

import { SkillBadge } from "@/clients/shared/components";
import { customAxios } from "@/clients/shared/libs/axios.libs";
import { SearchResultItem } from "@/server/domains/applicants/applicants.type";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

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
      <p className="text-xs text-gray-400 mb-1.5 font-bold">기술 스택</p>
      <div className="flex items-center gap-1.5 overflow-hidden">
        {displaySkills.map((skill) => (
          <SkillBadge key={skill} skill={skill} className="text-xs shrink-0" />
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
            외 {remainingCount}개
          </span>
        )}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "";
  const recruiterWalletAddress = useCurrentAccount()?.address;
  const queryClient = useQueryClient();

  const {
    data: searchResultCards,
    isLoading,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["selected-history-results", query, recruiterWalletAddress],
    queryFn: async () => {
      const response = await customAxios.get(`/api/v1/search`, {
        params: {
          query: query,
          limit: 20,
        },
        headers: {
          "X-Wallet-Address": recruiterWalletAddress,
        },
      });
      return response.data.data.results as SearchResultItem[];
    },
    enabled: !!query && !!recruiterWalletAddress,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });

  // 검색 성공 시 이력 목록 갱신
  useEffect(() => {
    if (isSuccess && recruiterWalletAddress) {
      queryClient.invalidateQueries({
        queryKey: ["search-history", recruiterWalletAddress],
      });
    }
  }, [isSuccess, recruiterWalletAddress, queryClient]);

  const handleCardClick = (applicantId: string) => {
    router.push(`/resume/${applicantId}`);
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

  // similarity 기준 정렬
  const sortedResults = searchResultCards
    ? [...searchResultCards].sort((a, b) => b.similarity - a.similarity)
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">검색 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">검색 중 오류가 발생했습니다.</div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* 결과 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-2">Result</h1>
        <p className="text-sm text-gray-400">
          총 {sortedResults.length}개의 결과를 찾았습니다
        </p>
      </div>

      {/* 결과 그리드 - 3열 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedResults.map((result) => (
          <button
            key={result.id}
            onClick={() => handleCardClick(result.id)}
            className="bg-[#2f2f2f] rounded-xl p-5 text-left hover:bg-[#3a3a3a] transition-colors border border-gray-700 hover:border-gray-600 flex flex-col h-[200px]"
          >
            {/* 직무 - 고정 높이 */}
            <div className="mb-1">
              <p className="text-white font-semibold text-base truncate text-left mb-1">
                {result.position}
              </p>
              <div className="flex justify-end">
                <span className="absolute top-4 right-4 px-2.5 py-1 bg-blue-500/15 text-blue-400 text-[11px] font-semibold rounded-md">
                  {(result.similarity * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-700 my-3" />

            <SkillStackPreview
              skills={result.techStack}
              getSortedSkills={getSortedSkills}
            />

            <p className="text-sm text-gray-400 line-clamp-2 max-h-10">
              {result.aiSummary}
            </p>
          </button>
        ))}
      </div>

      {/* 결과 없음 */}
      {sortedResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl font-semibold text-gray-300 mb-2">
            조건에 맞는 인재가 없어요
          </p>
          <p className="text-sm text-gray-500">다른 키워드로 검색해보세요</p>
        </div>
      )}
    </div>
  );
}
