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

  // 연결된 주소: 실제 지갑 또는 개발용 테스트 회사
  const connectedAddress = currentAccount?.address || DEV_CURRENT_COMPANY;
  const isConnected = !!connectedAddress;

  // 개발 모드일 때 회사 이름 표시
  const devCompanyName = !currentAccount && DEV_CURRENT_COMPANY
    ? TEST_COMPANIES.find((c: { address: string }) => c.address === DEV_CURRENT_COMPANY)?.name
    : undefined;

  return (
    <header className="h-14 border-b border-gray-800 flex items-center justify-end px-6 bg-[#171717]">
      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            {/* 개발 모드 표시 */}
            {devCompanyName && (
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                DEV: {devCompanyName}
              </span>
            )}
            {/* 주소 표시 */}
            <span className="text-sm text-gray-400">
              {formatAddress(connectedAddress)}
            </span>
            {/* 프로필 버튼 */}
            <Link href="/profile">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                profile
              </Button>
            </Link>
            {/* 연결 끊기 버튼 (실제 지갑 연결 시에만) */}
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
          </>
        ) : (
          /* 미연결 상태: Connect 버튼만 */
          <ConnectModal
            trigger={
              <Button variant="outline" size="sm">
                Connect Wallet
              </Button>
            }
          />
        )}
      </div>
    </header>
  );
}
