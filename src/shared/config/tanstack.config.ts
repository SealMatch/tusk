import { QueryClient } from "@tanstack/react-query";

export const QUERY_STALE_TIME = {
  PRICE: 30 * 1000,
  BALANCE: 10 * 1000,
  SHORT: 60 * 1000,
  MEDIUM: 5 * 60 * 1000,
  LONG: 30 * 60 * 1000,
  INFINITE: Infinity,
} as const;

export const QUERY_REFETCH_INTERVAL = {
  SHORT: 60 * 1000,
  MEDIUM: 5 * 60 * 1000,
  LONG: 30 * 60 * 1000,
  NEVER: false,
} as const;

export const queryClientConfig = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME.MEDIUM,
      gcTime: 10 * 60 * 1000,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      networkMode: "online",
    },
  },
});
