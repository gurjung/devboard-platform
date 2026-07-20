import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible NextAuth configuration.
 */

export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAuthRoute =
        nextUrl.pathname === "/sign-in" || nextUrl.pathname === "/sign-up";

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Let NextAuth redirect unauthenticated users to /sign-in
      }

      if (isOnAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
