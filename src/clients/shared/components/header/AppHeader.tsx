"use client";

import { NAVIGATION_PATHS } from "@/clients/shared/components/header/navigation.const";
import { NavigationLink } from "@/clients/shared/components/header/NavigationLink";
import { LogoIcon } from "@/clients/shared/components/icons";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const currentAccount = useCurrentAccount();
  const pathName = usePathname();
  return (
    // 1. sticky와 고정형 스타일(border-b) 적용
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-24 flex items-center justify-between">
        {/* Logo Area */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <LogoIcon className="w-8 h-8 text-white" />
          <span className="text-xl font-semibold text-white">Tusk</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {currentAccount && (
            <>
              {NAVIGATION_PATHS.map((path) => (
                <NavigationLink
                  key={path.href}
                  href={path.href}
                  isCurrentPath={pathName === path.href}>
                  {path.label}
                </NavigationLink>
              ))}
            </>
          )}
          <div className="wallet-button-wrapper">
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
