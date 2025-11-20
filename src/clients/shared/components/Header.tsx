"use client";

import { DEV_CURRENT_COMPANY, TEST_COMPANIES } from "@/clients/shared/mocks";
import { Button } from "@/clients/shared/ui/button";
import { formatAddress } from "@/clients/shared/utils/wallet.utils";
import {
  useCurrentAccount,
  ConnectModal,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { User, LogOut } from "lucide-react";
import Link from "next/link";

export function Header() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  // 실제 지갑이 연결되면 그 주소 사용, 아니면 개발용 테스트 회사 사용
  const displayAddress = currentAccount?.address || DEV_CURRENT_COMPANY;
  const isDevMode = !currentAccount;

  // 개발 모드일 때 회사 이름 표시
  const devCompanyName = isDevMode
    ? TEST_COMPANIES.find((c) => c.address === DEV_CURRENT_COMPANY)?.name
    : null;

  return (
    <header className="h-14 border-b border-gray-800 flex items-center justify-end px-6 bg-[#171717]">
      <div className="flex items-center gap-3">
        {isDevMode && devCompanyName && (
          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
            DEV: {devCompanyName}
          </span>
        )}
        <span className="text-sm text-gray-400">
          {formatAddress(displayAddress)}
        </span>
        <Link href="/profile">
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            profile
          </Button>
        </Link>
        {currentAccount && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => disconnect()}
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
        {!currentAccount && !isDevMode && (
          <ConnectModal
            trigger={
              <Button variant="ghost" size="sm" className="text-gray-400">
                Connect
              </Button>
            }
          />
        )}
      </div>
    </header>
  );
}
