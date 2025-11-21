"use client";

import { AppHeader } from "@/clients/shared/components/header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
