"use client";
import { LogoIcon } from "@/clients/shared/components/icons";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAVIGATION_PATHS } from "./navigation.const";
import { NavigationLink } from "./NavigationLink";

export const Header = () => {
  const currentAccount = useCurrentAccount();
  const [isScrolled, setIsScrolled] = useState(false);
  const pathName = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isMainPage = pathName === "/";

  return (
    <header className="sticky top-0 z-50 py-4 px-2 md:px-8 transition-all duration-300">
      <div className={`${isMainPage ? "max-w-7xl" : "max-w-9xl"} mx-auto`}>
        <div
          className={`
            flex items-center justify-between px-6 py-4 
            backdrop-blur-xl transition-all duration-300
            ${isMainPage && isScrolled ? "shadow-2xl" : "shadow-lg"}
            ${!isMainPage && "shadow-none"}
            ${isMainPage ? "rounded-full border" : ""}
          `}>
          {/* Logo */}
          <div className="flex items-center gap-4 cursor-pointer">
            <LogoIcon className="w-8 h-8 text-white" />
            <span className="text-2xl font-semibold text-white">Tusk</span>
          </div>

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
            <div className="wallet-button-wrapper cursor-pointer">
              <ConnectButton />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
