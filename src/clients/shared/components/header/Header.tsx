"use client";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Header = () => {
  const currentAccount = useCurrentAccount();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 py-6 px-4 md:px-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div
          className={`flex items-center justify-between px-6 py-4 rounded-full border transition-all duration-300 ${
            isScrolled
              ? "border-white/20 bg-black/60 backdrop-blur-xl shadow-2xl"
              : "border-white/10 bg-black/40 backdrop-blur-xl shadow-lg"
          }`}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full text-white"
                xmlns="http://www.w3.org/2000/svg">
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
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            {currentAccount && (
              <Link href="/profile" className="text-white">
                Profile
              </Link>
            )}
            <div className="wallet-button-wrapper cursor-pointer">
              <ConnectButton />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
