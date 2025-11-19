"use client";
import { queryClientConfig } from "@/clients/shared/config";
import { QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

export const TanstackQueryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <QueryClientProvider client={queryClientConfig}>
      {children}
    </QueryClientProvider>
  );
};
