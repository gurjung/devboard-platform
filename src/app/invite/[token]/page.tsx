"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Users, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useInvite, useAcceptInvite } from "@/features/workspace/hooks/invite/use-invite";
import { INVITE_REASONS, type InviteReason } from "@/features/workspace/constants";

interface InviteResponse {
  success: boolean;
  reason?: InviteReason;
  data?: {
    workspaceName: string;
    workspaceSlug?: string;
    email?: string;
    role?: string;
  };
}

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const { data: session, status: authStatus } = useSession();

  const { data: inviteData, isLoading: loadingInvite } = useInvite(token);
  const acceptInviteMutation = useAcceptInvite();

  const loading = loadingInvite || (authStatus as string) === "loading";
  const accepting = acceptInviteMutation.isPending;

  const handleAcceptInvite = () => {
    if (!token) return;

    acceptInviteMutation.mutate(token, {
      onSuccess: (resData) => {
        if (resData.success) {
          toast.success("Joined workspace successfully!");
          router.push(`/dashboard/${resData.data.workspaceSlug}`);
        } else {
          toast.error(resData.error || "Failed to accept invite");
        }
      },
      onError: (err: any) => {
        console.error("Error accepting invite:", err);
        toast.error(err.message || "Something went wrong. Please try again.");
      },
    });
  };

  // 1. Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-radial from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 p-4">
        <Card className="w-full max-w-md border-border/80 shadow-lg flex flex-col items-center justify-center p-8 rounded-3xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground mt-4 font-medium">
            Fetching invitation details...
          </p>
        </Card>
      </div>
    );
  }

  const reason = inviteData?.reason;
  const data = inviteData?.data;

  // 2. Error Cases / Non-pending invite statuses
  if (inviteData && !inviteData.success) {
    let title = "Invalid Invitation";
    let description = "This invitation link is invalid or has expired.";
    let icon = <ShieldAlert className="h-10 w-10 text-destructive mb-2" />;
    let actionButton = null;

    if (reason === INVITE_REASONS.NOT_FOUND) {
      title = "Invite link invalid";
      description = "The invitation token you used does not exist. Please check the URL and try again.";
    } else if (reason === INVITE_REASONS.REVOKED) {
      title = "Invitation revoked";
      description = "This invitation has been revoked by the workspace administrator.";
    } else if (reason === INVITE_REASONS.EXPIRED) {
      title = "Invitation expired";
      description = "This invitation has expired. Please request a new invite link from the workspace owner.";
    } else if (reason === INVITE_REASONS.ALREADY_ACCEPTED) {
      title = "Already a member";
      description = `You've already joined "${data?.workspaceName || "the workspace"}".`;
      icon = <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />;
      actionButton = (
        <Link
          href={`/dashboard/${data?.workspaceSlug}`}
          className={cn(buttonVariants({ variant: "default" }), "w-full cursor-pointer h-10 rounded-xl text-xs font-semibold flex items-center justify-center")}
        >
          Go to Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      );
    }

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
        <Card className="w-full max-w-md border-border/80 shadow-md rounded-2xl">
          <CardHeader className="flex flex-col items-center justify-center text-center p-6">
            {icon}
            <CardTitle className="text-xl font-bold tracking-tight mt-2">{title}</CardTitle>
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
                className={cn(buttonVariants({ variant: "outline" }), "w-full h-10 rounded-xl text-xs flex items-center justify-center cursor-pointer")}
              >
                Return to Dashboard
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Valid Pending Invite View
  if (inviteData?.success && data) {
    const isUserAuthenticated = authStatus === "authenticated";
    const isEmailMatching = isUserAuthenticated && session?.user?.email === data.email;

    // A. User not logged in
    if (!isUserAuthenticated) {
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
                  <span className="text-[10px] text-muted-foreground leading-none">Invited email</span>
                  <span className="text-xs font-medium truncate text-foreground mt-0.5">{data.email}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Link
                  href={`/sign-in${authQuery}`}
                  className={cn(buttonVariants({ variant: "outline" }), "flex-1 h-10 rounded-xl text-xs flex items-center justify-center cursor-pointer")}
                >
                  Sign In
                </Link>
                <Link
                  href={`/sign-up${authQuery}`}
                  className={cn(buttonVariants({ variant: "default" }), "flex-1 h-10 rounded-xl text-xs font-semibold flex items-center justify-center cursor-pointer")}
                >
                  Create Account
                </Link>
              </div>
            </CardContent>
            <CardFooter className="justify-center pt-2">
              <p className="text-[10px] text-muted-foreground">
                Please log in or sign up with the invited email to accept.
              </p>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // B. Logged in, but email mismatch
    if (!isEmailMatching) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
          <Card className="w-full max-w-md border-border/80 shadow-md rounded-2xl p-4">
            <CardHeader className="flex flex-col items-center justify-center text-center pb-4">
              <ShieldAlert className="h-10 w-10 text-amber-500 mb-2" />
              <CardTitle className="text-xl font-bold tracking-tight">
                Account Mismatch
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-normal mt-1">
                This invitation was sent to <span className="font-semibold text-foreground">{data.email}</span>, but you are signed in as <span className="font-semibold text-foreground">{session?.user?.email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Button
                variant="destructive"
                onClick={() => signOut({ callbackUrl: `/invite/${token}` })}
                className="w-full h-10 rounded-xl text-xs font-medium cursor-pointer"
              >
                Sign out and try again
              </Button>
            </CardContent>
            <CardFooter className="justify-center pt-2">
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost" }), "text-xs text-muted-foreground hover:text-foreground h-8 px-3 rounded-lg flex items-center justify-center cursor-pointer")}
              >
                Back to Dashboard
              </Link>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // C. Logged in with matching email
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
        <Card className="w-full max-w-md border-border/80 shadow-md rounded-2xl p-4">
          <CardHeader className="flex flex-col items-center justify-center text-center pb-4">
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle className="text-xl font-bold tracking-tight">
              Accept Invitation
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-normal mt-1">
              You are invited to join <span className="font-semibold text-foreground">{data.workspaceName}</span> as a <span className="font-semibold text-foreground capitalize">{data.role?.toLowerCase()}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-3 bg-muted/40 border border-border/50 rounded-xl flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted-foreground leading-none">Invited email</span>
                <span className="text-xs font-medium truncate text-foreground mt-0.5">{data.email}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "outline" }), "flex-1 h-10 rounded-xl text-xs flex items-center justify-center cursor-pointer")}
              >
                Decline
              </Link>
              <Button
                disabled={accepting}
                onClick={handleAcceptInvite}
                className="flex-1 h-10 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    Accept Invite
                  </>
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center pt-2">
            <p className="text-[10px] text-muted-foreground text-center">
              By accepting, you will gain access to this workspace and its resources.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
}
