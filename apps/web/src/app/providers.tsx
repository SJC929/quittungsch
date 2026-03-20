"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { LanguageProvider } from "@/contexts/language-context";

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}
