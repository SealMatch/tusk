"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";

export const AppHeader = () => {
  const currentAccount = useCurrentAccount();

  return (
    // 1. sticky와 고정형 스타일(border-b) 적용
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-full h-full text-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xl font-semibold text-white">Seal Match</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {currentAccount && (
            <Link href="/profile" className="text-sm font-medium text-white hover:text-white/80 transition-colors">
              Profile
            </Link>
          )}
          <div className="wallet-button-wrapper">
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  );
};