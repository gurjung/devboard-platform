"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Trash2, Shield, User } from "lucide-react";
import { WORKSPACE_ROLES, type WorkspaceRole } from "@/features/workspace/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MembersListSkeleton } from "./members-list-skeleton";
import { MembersListError } from "./members-list-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaceMembers, type WorkspaceMemberData } from "../hooks/use-workspace-members";
import { useUpdateMemberRole } from "../hooks/use-update-member-role";
import { useRemoveMember } from "../hooks/use-remove-member";
import { cn } from "@/lib/utils";

interface MembersListProps {
  workspaceId: string;
  currentUserId: string;
  currentUserRole: WorkspaceRole;
}

export function MembersList({
  workspaceId,
  currentUserId,
  currentUserRole,
}: MembersListProps) {
  const { data: members, isLoading, isError, error } = useWorkspaceMembers(workspaceId);
  const updateRoleMutation = useUpdateMemberRole(workspaceId);
  const removeMemberMutation = useRemoveMember(workspaceId);

  // States for confirmation dialogs
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMemberData | null>(null);
  const [roleChangeRequest, setRoleChangeRequest] = useState<{
    member: WorkspaceMemberData;
    newRole: WorkspaceRole;
  } | null>(null);

  if (isLoading) {
    return <MembersListSkeleton />;
  }

  if (isError) {
    return (
      <MembersListError
        message={error instanceof Error ? error.message : undefined}
      />
    );
  }

  const handleRoleChange = (member: WorkspaceMemberData, value: string) => {
    const newRole = value as WorkspaceRole;
    if (newRole === member.role) return;

    // If changing to OWNER, it's a transfer of ownership, so we must show a confirmation warning.
    if (newRole === WORKSPACE_ROLES.OWNER) {
      setRoleChangeRequest({ member, newRole });
      return;
    }

    // Standard role change
    executeRoleChange(member.id, newRole);
  };

  const executeRoleChange = (memberId: string, role: WorkspaceRole) => {
    updateRoleMutation.mutate(
      { memberId, role },
      {
        onSuccess: () => {
          toast.success("Member role updated successfully!");
          setRoleChangeRequest(null);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update role");
        },
      }
    );
  };

  const handleConfirmRoleChange = () => {
    if (!roleChangeRequest) return;
    executeRoleChange(roleChangeRequest.member.id, roleChangeRequest.newRole);
  };

  const handleRemoveMember = (member: WorkspaceMemberData) => {
    setMemberToRemove(member);
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;
    removeMemberMutation.mutate(memberToRemove.id, {
      onSuccess: () => {
        toast.success(`${memberToRemove.user.name || "Member"} removed from workspace.`);
        setMemberToRemove(null);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to remove member");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members?.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const isOwner = member.role === WORKSPACE_ROLES.OWNER;
          const isAdmin = member.role === WORKSPACE_ROLES.ADMIN;

          // Determine if requester can change this member's role
          let canChangeRole = false;
          let selectOptions: WorkspaceRole[] = [];

          if (!isCurrentUser) {
            if (currentUserRole === WORKSPACE_ROLES.OWNER) {
              canChangeRole = true;
              selectOptions = [WORKSPACE_ROLES.MEMBER, WORKSPACE_ROLES.ADMIN, WORKSPACE_ROLES.OWNER];
            } else if (currentUserRole === WORKSPACE_ROLES.ADMIN && !isOwner) {
              canChangeRole = true;
              selectOptions = [WORKSPACE_ROLES.MEMBER, WORKSPACE_ROLES.ADMIN];
            }
          }

          // Determine if requester can remove this member
          const canRemove = currentUserRole === WORKSPACE_ROLES.OWNER && !isCurrentUser;

          return (
            <Card
              key={member.id}
              className="rounded-2xl border border-border/80 shadow-sm bg-card hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-5 flex flex-col gap-4 justify-between h-full">
                {/* Header row: User Details + Action */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={member.user.image || undefined} alt={member.user.name || ""} />
                      <AvatarFallback className="bg-muted text-foreground font-semibold text-xs">
                        {member.user.name
                          ? member.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                          : "MB"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                        {member.user.name || "Anonymous User"}
                        {isCurrentUser && (
                          <span className="bg-neutral-200 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                            You
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {member.user.email}
                      </span>
                    </div>
                  </div>

                  {canRemove && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveMember(member)}
                      className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
                      title="Remove member"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                {/* Bottom row: Role Selector or Static Badge */}
                <div className="flex items-center justify-between border-t border-border/50 pt-3 gap-4">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Role
                  </span>
                  
                  {canChangeRole ? (
                    <Select
                      value={member.role}
                      onValueChange={(val) => {
                        if (val) handleRoleChange(member, val);
                      }}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-28 h-8 px-2 bg-input/20 border-border/80 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary/20 hover:border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="min-w-36 p-1 rounded-lg shadow-md border border-border/80">
                        {selectOptions.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt === WORKSPACE_ROLES.OWNER
                              ? "Owner (Transfer)"
                              : opt === WORKSPACE_ROLES.ADMIN
                              ? "Admin"
                              : "Member"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                      {isOwner ? (
                        <>
                          <Shield className="size-3.5 text-amber-500 fill-amber-500/20" />
                          Owner
                        </>
                      ) : isAdmin ? (
                        <>
                          <Shield className="size-3.5 text-blue-500 fill-blue-500/20" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="size-3.5 text-neutral-400" />
                          Member
                        </>
                      )}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Remove Member Confirmation Dialog */}
      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Remove Member"
        description={`Are you sure you want to remove ${
          memberToRemove?.user.name || memberToRemove?.user.email || "this member"
        } from the workspace? All their project access will be revoked.`}
        confirmLabel="Remove Member"
        confirmLoadingLabel="Removing..."
        onConfirm={handleConfirmRemove}
        isLoading={removeMemberMutation.isPending}
        variant="danger"
      />

      {/* Ownership Transfer Confirmation Dialog */}
      <ConfirmDialog
        open={!!roleChangeRequest}
        onOpenChange={(open) => !open && setRoleChangeRequest(null)}
        title="Transfer Workspace Ownership"
        description={`Are you sure you want to transfer ownership of the workspace to ${
          roleChangeRequest?.member.user.name || roleChangeRequest?.member.user.email || "this member"
        }? You will be demoted to Admin and will no longer have full owner-level access.`}
        confirmLabel="Transfer Ownership"
        confirmLoadingLabel="Transferring..."
        onConfirm={handleConfirmRoleChange}
        isLoading={updateRoleMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
