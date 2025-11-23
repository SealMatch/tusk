"use client";

import { AppHeader } from "@/clients/shared/components/header";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const currentAccount = useCurrentAccount();
  const router = useRouter();

  useEffect(() => {
    if (!currentAccount) {
      router.push("/");
    }
  }, [currentAccount, router]);

  return (
    <div className="bg-[#2f2f2f] flex flex-col min-h-screen">
      <AppHeader />
      {children}
    </div>
  );
}
