"use client";

import { AppHeader } from "@/clients/shared/components/header";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const currentAccount = useCurrentAccount();
  const router = useRouter();
  if (!currentAccount) {
    router.push("/");
    return null;
  }
  return (
    <div className="bg-[#2f2f2f] flex flex-col min-h-screen">
      <AppHeader />
      {children}
    </div>
  );
}
