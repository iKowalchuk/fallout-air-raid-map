import { isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent immediate refetch after SSR hydration
        staleTime: 60 * 1000,
        // Keep unused data in cache for 10 minutes (increased from 5)
        // Gives more buffer for navigation between pages
        gcTime: 10 * 60 * 1000,
        // Retry failed requests with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for real-time data
        refetchOnWindowFocus: true,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: always create a new QueryClient
    return makeQueryClient();
  }
  // Browser: reuse the same QueryClient
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
