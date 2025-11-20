"use client";
import { NETWORK_CONFIG } from "@/clients/shared/config";
import { SuiClientProvider as SuiBaseClientProvider } from "@mysten/dapp-kit";
import React from "react";

export const SuiClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SuiBaseClientProvider networks={NETWORK_CONFIG} defaultNetwork="testnet">
      {children}
    </SuiBaseClientProvider>
  );
};
