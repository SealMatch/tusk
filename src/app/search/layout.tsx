"use client";

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#212121]">
      {/* 좌측 사이드바 */}
      <aside className="w-64 bg-[#171717] border-r border-gray-800 p-4">
        <nav className="space-y-2">
          {/* 프로젝트 메뉴, 채팅 히스토리 등 */}
        </nav>
      </aside>
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="h-14 border-b border-gray-800 flex items-center px-4">
          {/* 검색 타이틀, 프로필 버튼 */}
        </header>
        
        {/* 콘텐츠 영역 */}
        <div className="flex-1 overflow-auto flex justify-center">
          <div className="w-full max-w-3xl p-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}