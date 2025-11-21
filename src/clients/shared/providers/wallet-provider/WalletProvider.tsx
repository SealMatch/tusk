"use client";
import { WALLET_PROVIDER_DARK_THEME } from "@/clients/shared/config";
import { WalletProvider as SuiWalletProvider } from "@mysten/dapp-kit";
import React from "react";

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SuiWalletProvider
      autoConnect
      theme={[
        {
          variables: WALLET_PROVIDER_DARK_THEME,
        },
      ]}>
      {children}
    </SuiWalletProvider>
  );
};
