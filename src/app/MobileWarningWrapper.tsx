"use client";

import { MobileWarning } from "@/clients/shared/components/MobileWarning";
import { useIsMobile } from "@/clients/shared/hooks";

export function MobileWarningWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile, isClient } = useIsMobile(1000);

  // SSR 시 children 렌더링 (hydration mismatch 방지)
  if (!isClient) {
    return <>{children}</>;
  }

  // 1000px 이하면 모바일 경고 표시
  if (isMobile) {
    return <MobileWarning />;
  }

  // 정상 화면 표시
  return <>{children}</>;
}
