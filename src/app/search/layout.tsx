"use client";

import { useSearchStore } from "@/clients/shared/stores";
import { Button } from "@/clients/shared/ui/button";
import { PenSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { history, removeHistory, clearHistory } = useSearchStore();

  const handleHistoryClick = (query: string) => {
    const params = new URLSearchParams({ query });
    router.push(`/search/results?${params.toString()}`);
  };

  return (
    <div className="flex flex-1 bg-[#212121]">
      {/* 좌측 사이드바 */}
      <aside className="w-64 bg-[#171717] border-r border-gray-800 flex flex-col">
        {/* 사이드바 헤더 */}
        <div className="p-4">
          <Link href="/search">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-300 hover:bg-[#2f2f2f] hover:text-white"
            >
              <PenSquare className="h-4 w-4" />
              새 검색
            </Button>
          </Link>
        </div>

        {/* 검색 히스토리 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">검색 히스토리</h3>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={clearHistory}
                className="text-gray-500 hover:text-gray-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <nav className="space-y-1">
            {history.length === 0 ? (
              <p className="text-xs text-gray-600 py-2">검색 기록이 없습니다</p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-2 rounded-md hover:bg-gray-800 cursor-pointer"
                >
                  <button
                    onClick={() => handleHistoryClick(item.query)}
                    className="flex-1 text-left px-3 py-2 text-sm text-gray-300 truncate"
                  >
                    {item.query}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistory(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 mr-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </nav>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto flex justify-center">
        <div className="w-full max-w-3xl p-4">{children}</div>
      </main>
    </div>
  );
}
