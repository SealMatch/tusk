"use client";

import { SkillBadge } from "@/clients/shared/components";
import { getMockSearchResponse } from "@/clients/shared/mocks";
import type { ResumeResult } from "@/clients/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

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
      <p className="text-xs text-gray-500 mb-1.5">기술 스택</p>
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      // TODO: 실제 API 연동 시 axios 인스턴스 사용
      // const response = await customAxios.get(`/api/v1/search?query=${query}`);
      // return response.data;

      // 목데이터 사용
      return getMockSearchResponse(query);
    },
    enabled: !!query,
  });

  const handleCardClick = (blobId: string) => {
    router.push(`/resume/${blobId}`);
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
          총 {data?.total || 0}개의 결과를 찾았습니다
        </p>
      </div>

      {/* 결과 그리드 - 3열 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.results.map((result: ResumeResult) => (
          <button
            key={result.blobId}
            onClick={() => handleCardClick(result.blobId)}
            className="bg-[#2f2f2f] rounded-xl p-5 text-left hover:bg-[#3a3a3a] transition-colors border border-gray-700 hover:border-gray-600 flex flex-col h-[200px]"
          >
            {/* 직무 - 고정 높이 */}
            <div className="h-[28px] mb-1">
              <p className="text-white font-semibold text-base truncate">
                {result.position}
              </p>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-700 my-3" />

            <SkillStackPreview
              skills={result.skills}
              getSortedSkills={getSortedSkills}
            />

            <p className="text-sm text-gray-400 line-clamp-2 flex-1">
              {result.introduction}
            </p>
          </button>
        ))}
      </div>

      {/* 결과 없음 */}
      {data?.results.length === 0 && (
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
