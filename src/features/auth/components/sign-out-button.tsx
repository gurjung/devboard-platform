"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants";
import { en } from "@/locales/en";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: AUTH_ROUTES.signIn })}
    >
      {en.auth.signOut.button}
    </Button>
  );
}
