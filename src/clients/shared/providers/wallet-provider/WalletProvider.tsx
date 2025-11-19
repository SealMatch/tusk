"use client";
import { WalletProvider as SuiWalletProvider } from "@mysten/dapp-kit";
import React from "react";

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return <SuiWalletProvider>{children}</SuiWalletProvider>;
};
