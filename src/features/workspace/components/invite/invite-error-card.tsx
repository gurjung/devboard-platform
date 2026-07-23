"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  INVITE_REASONS,
  type InviteReason,
} from "@/features/workspace/constants";
import { en } from "@/locales/en";

interface InviteErrorCardProps {
  reason?: InviteReason;
  data?: {
    workspaceName: string;
    workspaceSlug?: string;
  };
}

export function InviteErrorCard({ reason, data }: InviteErrorCardProps) {
  let title: string = en.workspace.invite.errors.default.title;
  let description: string = en.workspace.invite.errors.default.description;
  let icon = <ShieldAlert className="h-10 w-10 text-destructive mb-2" />;
  let actionButton = null;

  if (reason === INVITE_REASONS.NOT_FOUND) {
    title = en.workspace.invite.errors.NOT_FOUND.title;
    description = en.workspace.invite.errors.NOT_FOUND.description;
  } else if (reason === INVITE_REASONS.REVOKED) {
    title = en.workspace.invite.errors.REVOKED.title;
    description = en.workspace.invite.errors.REVOKED.description;
  } else if (reason === INVITE_REASONS.EXPIRED) {
    title = en.workspace.invite.errors.EXPIRED.title;
    description = en.workspace.invite.errors.EXPIRED.description;
  } else if (reason === INVITE_REASONS.ALREADY_ACCEPTED) {
    title = en.workspace.invite.errors.ALREADY_ACCEPTED.title;
    description = `You've already joined "${data?.workspaceName || "the workspace"}".`;
    icon = <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />;
    actionButton = (
      <Link
        href={`/dashboard/${data?.workspaceSlug}`}
        className={cn(
          buttonVariants({ variant: "default" }),
          "w-full cursor-pointer h-10 rounded-xl text-xs font-semibold flex items-center justify-center"
        )}
      >
        {en.workspace.invite.errors.goToDashboard}{" "}
        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Link>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <Card className="w-full max-w-md border-border/80 shadow-md rounded-2xl">
        <CardHeader className="flex flex-col items-center justify-center text-center p-6">
          {icon}
          <CardTitle className="text-xl font-bold tracking-tight mt-2">
            {title}
          </CardTitle>
          <CardDescription className="text-xs mt-1 text-muted-foreground leading-normal max-w-xs">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 text-center">
          {actionButton ? (
            actionButton
          ) : (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full h-10 rounded-xl text-xs flex items-center justify-center cursor-pointer"
              )}
            >
              {en.workspace.invite.errors.returnToDashboard}
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
