import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Next.js Proxy for Route Protection (Next.js 16+ convention replacing middleware.ts).
 *
 * WHY IMPORT FROM `@/auth.config` INSTEAD OF `@/auth`?
 * Using `authConfig` isolates HTTP-level route protection logic from Prisma ORM
 * and database drivers, keeping the proxy runtime lightweight and fast.
 *
 * SERVER-SIDE SESSION CHECK IN `src/app/dashboard/layout.tsx`:
 * The server-side session check in `src/app/dashboard/layout.tsx` can safely remain in place.
 * Proxy acts as an early HTTP routing check, while the layout check serves as a redundant,
 * server-side defense-in-depth safety net. They work together without conflict.
 */
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
