"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  type Persister,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { type ReactNode, useState } from "react";
import { createIndexedDBPersister } from "@/lib/react-query";

interface QueryProviderProps {
  children: ReactNode;
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent immediate refetch after SSR hydration
        staleTime: 60 * 1000,
        // Keep unused data in cache indefinitely for persistence
        gcTime: Number.POSITIVE_INFINITY,
        // Retry failed requests with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for real-time data
        refetchOnWindowFocus: true,
      },
    },
  });
}

// Use globalThis to persist singletons across Fast Refresh/HMR
// Module-level variables get reset during HMR, but globalThis survives
declare global {
  // eslint-disable-next-line no-var
  var __queryClient: QueryClient | undefined;
  // eslint-disable-next-line no-var
  var __queryPersister: Persister | null | undefined;
}

function getOrCreateQueryClient(): QueryClient {
  // Server-side: always create new client (no singleton needed)
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  // Client-side: use globalThis to survive Fast Refresh
  if (!globalThis.__queryClient) {
    globalThis.__queryClient = makeQueryClient();
  }
  return globalThis.__queryClient;
}

function getOrCreatePersister(): Persister | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (globalThis.__queryPersister === undefined) {
    globalThis.__queryPersister = createIndexedDBPersister();
  }
  return globalThis.__queryPersister;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(getOrCreateQueryClient);
  const [clientPersister] = useState(getOrCreatePersister);

  const devtools = process.env.NODE_ENV === "development" && (
    <ReactQueryDevtools initialIsOpen={false} />
  );

  // Server-side or no IndexedDB support - use standard provider
  if (!clientPersister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        {devtools}
      </QueryClientProvider>
    );
  }

  // Client-side with persistence
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: clientPersister,
        maxAge: Number.POSITIVE_INFINITY,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
    >
      {children}
      {devtools}
    </PersistQueryClientProvider>
  );
}
