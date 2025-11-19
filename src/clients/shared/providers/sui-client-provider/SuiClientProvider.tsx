"use client";
import { networkConfig } from "@/clients/shared/config";
import { SuiClientProvider as SuiBaseClientProvider } from "@mysten/dapp-kit";
import React from "react";

export const SuiClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SuiBaseClientProvider networks={networkConfig} defaultNetwork="testnet">
      {children}
    </SuiBaseClientProvider>
  );
};
