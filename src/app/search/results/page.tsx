"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/clients/shared/ui/button";
import { Badge } from "@/clients/shared/ui/badge";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  
  const { data, isLoading } = useQuery({
    queryKey: ["search", searchParams.toString()],
    queryFn: async () => {
      // API 호출
      const response = await fetch(`/api/search?${searchParams.toString()}`);
      return response.json();
    },
  });

  if (isLoading) return <div>검색 중...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">검색 결과</h1>
      
      <div className="space-y-3">
        {data?.results?.map((result: any) => (
          <div key={result.blobId} className="bg-[#2f2f2f] rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-medium">BlobId: {result.blobId}</p>
                <div className="flex gap-2 mt-2">
                  {result.skills?.map((skill: string) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="outline">
                열람 요청
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}