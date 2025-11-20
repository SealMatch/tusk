"use client";

import { getMockSearchResponse } from "@/clients/shared/mocks";
import type { ResumeResult } from "@/clients/shared/types";
import { Badge } from "@/clients/shared/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      // TODO: 실제 API 연동 시 axios 인스턴스 사용
      // const response = await customAxios.get(`/api/search?query=${query}`);
      // return response.data;

      // 목데이터 사용
      return getMockSearchResponse(query);
    },
    enabled: !!query,
  });

  const handleCardClick = (blobId: string) => {
    router.push(`/resume/${blobId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">검색 중...</div>
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
            className="bg-[#2f2f2f] rounded-xl p-4 text-left hover:bg-[#3a3a3a] transition-colors border border-gray-700 hover:border-gray-600"
          >
            {/* 직무 */}
            <p className="text-white font-semibold text-sm mb-2">
              {result.position}
            </p>

            {/* 구분선 */}
            <div className="border-t border-gray-700 my-3" />

            {/* 기술 스택 */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1.5">기술 스택</p>
              <div className="flex flex-wrap gap-1.5">
                {result.skills.slice(0, 3).map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs bg-gray-700 hover:bg-gray-600"
                  >
                    {skill}
                  </Badge>
                ))}
                {result.skills.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-600 text-gray-400"
                  >
                    +{result.skills.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* 자기소개 (1줄 말줄임) */}
            <p className="text-xs text-gray-400 line-clamp-1">
              {result.introduction}
            </p>

            {/* TODO: 매칭률 표시 영역 */}
            {/* {result.matchRate && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${result.matchRate}%` }}
                  />
                </div>
                <span className="text-xs text-primary font-medium">
                  {result.matchRate}%
                </span>
              </div>
            )} */}
          </button>
        ))}
      </div>

      {/* 결과 없음 */}
      {data?.results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
