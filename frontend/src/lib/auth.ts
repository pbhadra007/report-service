import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@/types";

const MOCK_TEST_PASSWORD = "ipdc1234";
const MOCK_ADMIN_EMAIL = "IPDC-admin";
const MOCK_ADMIN_PASSWORD = "admin1234";

declare module "@auth/core/types" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      isAdmin: boolean;
      branchId?: string;
      employeeId?: string;
      designation?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    isAdmin: boolean;
    branchId?: string;
    employeeId?: string;
    designation?: string;
    accessToken: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    role?: Role;
    userId?: string;
    isAdmin?: boolean;
    branchId?: string;
    employeeId?: string;
    designation?: string;
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
      // Mocked pending backend integration: username "admin" (submitted as
      // "IPDC-admin" by the sign-in form) grants an admin session; any other
      // username + the shared test password grants a regular BRANCH_MANAGER
      // session.
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) {
          return {
            id: "mock-admin-1",
            name: "Admin User",
            email,
            role: "SYSTEM_ADMIN",
            isAdmin: true,
            employeeId: "IPDC-0001",
            designation: "System Administrator",
            accessToken: "mock-access-token",
          };
        }

        if (password !== MOCK_TEST_PASSWORD) {
          return null;
        }

        return {
          id: "mock-user-1",
          name: email.split("@")[0] ?? email,
          email,
          role: "BRANCH_MANAGER",
          isAdmin: false,
          branchId: "BR-001",
          employeeId: "IPDC-1024",
          designation: "Relationship Manager",
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
        token.isAdmin = user.isAdmin;
        token.branchId = user.branchId;
        token.employeeId = user.employeeId;
        token.designation = user.designation;
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
        isAdmin: token.isAdmin ?? false,
        branchId: token.branchId,
        employeeId: token.employeeId,
        designation: token.designation,
      };
      return typedSession;
    },
  },
});
