"use client";

import { SessionProvider } from "next-auth/react";

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}