import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@/types";

const MOCK_TEST_PASSWORD = "ipdc1234";

declare module "@auth/core/types" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      branchId?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    branchId?: string;
    accessToken: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    role?: Role;
    userId?: string;
    branchId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Mocked pending backend integration: any email + the shared test
      // password succeeds and is granted a BRANCH_MANAGER session.
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }
        if (password !== MOCK_TEST_PASSWORD) {
          return null;
        }

        return {
          id: "mock-user-1",
          name: email.split("@")[0] ?? email,
          email,
          role: "BRANCH_MANAGER",
          branchId: "BR-001",
          accessToken: "mock-access-token",
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.userId = user.id;
        token.branchId = user.branchId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const typedSession = session as import("@auth/core/types").Session;
      typedSession.accessToken = token.accessToken;
      typedSession.user = {
        id: token.userId ?? "",
        name: token.name ?? "",
        email: token.email ?? "",
        role: token.role ?? "BRANCH_MANAGER",
        branchId: token.branchId,
      };
      return typedSession;
    },
  },
});
