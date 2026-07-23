"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useInvite,
  useAcceptInvite,
} from "@/features/workspace/hooks/invite/use-invite";
import { en } from "@/locales/en";
import { InviteLoadingCard } from "@/features/workspace/components/invite/invite-loading-card";
import { InviteErrorCard } from "@/features/workspace/components/invite/invite-error-card";
import { InviteUnauthenticatedCard } from "@/features/workspace/components/invite/invite-unauthenticated-card";
import { InviteMismatchCard } from "@/features/workspace/components/invite/invite-mismatch-card";
import { InviteAcceptCard } from "@/features/workspace/components/invite/invite-accept-card";

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
          toast.success(en.workspace.invite.accept.toastSuccess);
          router.push(`/dashboard/${resData.data.workspaceSlug}`);
        } else {
          toast.error(resData.error || en.workspace.invite.accept.toastError);
        }
      },
      onError: (err: any) => {
        console.error("Error accepting invite:", err);
        toast.error(
          err.message || en.workspace.invite.accept.toastErrorGeneric
        );
      },
    });
  };

  // 1. Loading state
  if (loading) {
    return <InviteLoadingCard />;
  }

  // 2. Error Cases / Non-pending invite statuses
  if (inviteData && !inviteData.success) {
    return (
      <InviteErrorCard reason={inviteData.reason} data={inviteData.data} />
    );
  }

  // 3. Valid Pending Invite View
  if (inviteData?.success && inviteData.data) {
    const data = inviteData.data;
    const isUserAuthenticated = authStatus === "authenticated";
    const isEmailMatching =
      isUserAuthenticated && session?.user?.email === data.email;

    // A. User not logged in
    if (!isUserAuthenticated) {
      return (
        <InviteUnauthenticatedCard
          token={token}
          data={{
            workspaceName: data.workspaceName,
            email: data.email,
            role: data.role,
          }}
        />
      );
    }

    // B. Logged in, but email mismatch
    if (!isEmailMatching) {
      return (
        <InviteMismatchCard
          token={token}
          invitedEmail={data.email}
          currentUserEmail={session?.user?.email}
        />
      );
    }

    // C. Logged in with matching email
    return (
      <InviteAcceptCard
        accepting={accepting}
        onAcceptInvite={handleAcceptInvite}
        data={{
          workspaceName: data.workspaceName,
          email: data.email,
          role: data.role,
        }}
      />
    );
  }

  return null;
}
