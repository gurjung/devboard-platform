"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { en } from "@/locales/en";

interface InviteMismatchCardProps {
  token: string;
  invitedEmail?: string;
  currentUserEmail?: string | null;
}

export function InviteMismatchCard({
  token,
  invitedEmail,
  currentUserEmail,
}: InviteMismatchCardProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <Card className="w-full max-w-md border-border/80 shadow-md rounded-2xl p-4">
        <CardHeader className="flex flex-col items-center justify-center text-center pb-4">
          <ShieldAlert className="h-10 w-10 text-amber-500 mb-2" />
          <CardTitle className="text-xl font-bold tracking-tight">
            {en.workspace.invite.mismatch.title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-normal mt-1">
            This invitation was sent to{" "}
            <span className="font-semibold text-foreground">
              {invitedEmail}
            </span>
            , but you are signed in as{" "}
            <span className="font-semibold text-foreground">
              {currentUserEmail}
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: `/invite/${token}` })}
            className="w-full h-10 rounded-xl text-xs font-medium cursor-pointer"
          >
            {en.workspace.invite.mismatch.signOutButton}
          </Button>
        </CardContent>
        <CardFooter className="justify-center pt-2">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-xs text-muted-foreground hover:text-foreground h-8 px-3 rounded-lg flex items-center justify-center cursor-pointer"
            )}
          >
            {en.workspace.invite.mismatch.backButton}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
