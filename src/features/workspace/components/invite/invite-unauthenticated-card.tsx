"use client";

import React from "react";
import Link from "next/link";
import { Mail, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { en } from "@/locales/en";

interface InviteUnauthenticatedCardProps {
  token: string;
  data: {
    workspaceName: string;
    email?: string;
    role?: string;
  };
}

export function InviteUnauthenticatedCard({ token, data }: InviteUnauthenticatedCardProps) {
  // Construct callbackUrl back to this invite page
  const currentUrl = typeof window !== "undefined" ? window.location.pathname : `/invite/${token}`;
  const authQuery = `?callbackUrl=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <Card className="w-full max-w-md border-border/80 shadow-md rounded-2xl p-4">
        <CardHeader className="flex flex-col items-center justify-center text-center pb-4">
          <Users className="h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-xl font-bold tracking-tight">
            Join {data.workspaceName}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-normal mt-1 max-w-xs">
            You have been invited to join <span className="font-semibold text-foreground">{data.workspaceName}</span> as a <span className="font-semibold text-foreground capitalize">{data.role?.toLowerCase()}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="p-3 bg-muted/40 border border-border/50 rounded-xl flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted-foreground leading-none">{en.workspace.invite.accept.invitedEmailLabel}</span>
              <span className="text-xs font-medium truncate text-foreground mt-0.5">{data.email}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link
              href={`/sign-in${authQuery}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-1 h-10 rounded-xl text-xs flex items-center justify-center cursor-pointer"
              )}
            >
              {en.workspace.invite.unauthenticated.signInButton}
            </Link>
            <Link
              href={`/sign-up${authQuery}`}
              className={cn(
                buttonVariants({ variant: "default" }),
                "flex-1 h-10 rounded-xl text-xs font-semibold flex items-center justify-center cursor-pointer"
              )}
            >
              {en.workspace.invite.unauthenticated.createAccountButton}
            </Link>
          </div>
        </CardContent>
        <CardFooter className="justify-center pt-2">
          <p className="text-[10px] text-muted-foreground">
            {en.workspace.invite.unauthenticated.footer}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
