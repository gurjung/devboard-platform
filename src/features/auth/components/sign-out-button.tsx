"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: AUTH_ROUTES.signIn })}
    >
      Sign out
    </Button>
  );
}
