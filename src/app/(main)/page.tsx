"use client";

import { MainTemplate } from "@/clients/components/main/templates";
import { MobileWarning } from "@/clients/shared/components/MobileWarning";
import { useIsMobile } from "@/clients/shared/hooks";

export default function Home() {
  const { isMobile, isClient } = useIsMobile(1000);

  // SSR 시 빈 화면 (hydration mismatch 방지)
  if (!isClient) {
    return null;
  }

  // 1000px 이하면 모바일 경고 표시
  if (isMobile) {
    return <MobileWarning />;
  }

  // 기존 메인 템플릿
  return (
    <main className="w-full flex flex-col flex-1 overflow-y-auto snap-y snap-mandatory">
      <MainTemplate />
    </main>
  );
}
