import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible NextAuth configuration.
 *
 * WHY SPLIT THE AUTH CONFIGURATION?
 * Next.js Middleware runs on the Edge runtime by default. Prisma ORM and Node.js-specific
 * modules (like crypto/bcrypt used in Credentials authorize()) are NOT compatible with the Edge runtime.
 *
 * By isolating edge-safe configuration options (such as custom pages and the `authorized` callback)
 * into this `auth.config.ts` file, `src/middleware.ts` can import `authConfig` without pulling in Prisma.
 * The full auth configuration in `src/auth.ts` spreads `authConfig` and adds PrismaAdapter and Credentials.
 *
 * REDUNDANT SAFETY NET CONFIRMATION:
 * The existing server-side session check in `src/app/dashboard/layout.tsx` can safely remain in place.
 * Middleware provides an early HTTP-level check at the network boundary, while `layout.tsx` provides
 * defense-in-depth on the Node.js server side. The two mechanisms complement each other without conflict.
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
