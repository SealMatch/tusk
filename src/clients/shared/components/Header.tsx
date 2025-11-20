"use client";

import { Button } from "@/clients/shared/ui/button";
import { formatAddress } from "@/clients/shared/utils/wallet.utils";
import { useCurrentAccount, ConnectModal } from "@mysten/dapp-kit";
import { User } from "lucide-react";
import Link from "next/link";

export function Header() {
  const currentAccount = useCurrentAccount();

  return (
    <header className="h-14 border-b border-gray-800 flex items-center justify-end px-6 bg-[#171717]">
      {currentAccount ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {formatAddress(currentAccount.address)}
          </span>
          <Link href="/profile">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              profile
            </Button>
          </Link>
        </div>
      ) : (
        <ConnectModal
          trigger={
            <Button variant="outline" size="sm">
              Connect Wallet
            </Button>
          }
        />
      )}
    </header>
  );
}
