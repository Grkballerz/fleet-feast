"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { createQueryClient } from "@/lib/queries";

/**
 * Providers Component
 * Wraps the application with required context providers:
 * - SessionProvider: NextAuth.js authentication
 * - QueryClientProvider: TanStack Query for server state management
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance once per session
  const [queryClient] = useState(() => createQueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
